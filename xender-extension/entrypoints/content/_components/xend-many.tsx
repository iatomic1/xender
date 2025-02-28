import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { XendCart } from "@/lib/storage";
import { EXPLORER_BASE_URL, SUPPORTED_TOKENS } from "@/lib/constants";
import { useTokenBalance } from "@/hooks/useTokenBalance"; // Import our hook
import { websiteMessenger } from "@/lib/window-messaging";
import { Row } from "@/lib/tx";
import { truncateStr } from "@/lib/helpers";

const formSchema = z.object({
  currency: z.string(),
  amount: z
    .string()
    .refine(
      (val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) > 0,
      {
        message: "Amount must be a positive number",
      },
    ),
});

type FormValues = z.infer<typeof formSchema>;

export default function XendMany({
  children,
  items,
  balance,
  address,
}: {
  children: React.ReactNode;
  items: XendCart[];
  balance: any;
  address: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  // Use our token balance hook
  const { availableTokens, tokenBalances, validateAmount } = useTokenBalance(
    balance,
    SUPPORTED_TOKENS,
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: "STX",
      amount: "",
    },
  });

  // Watch the currency field to update the balance display
  const selectedCurrency = useWatch({
    control: form.control,
    name: "currency",
  });

  // Get current balance based on selected currency
  const currentBalance =
    tokenBalances[selectedCurrency]?.formattedBalance || "0";

  // Calculate total amount to be sent (amount × number of recipients)
  const totalAmount = useMemo(() => {
    const amount = Number.parseFloat(form.watch("amount") || "0");
    return isNaN(amount) ? 0 : amount * items.length;
  }, [form.watch("amount"), items.length]);

  async function onSubmit(values: FormValues) {
    // Validate total amount against balance
    if (!validateAmount(String(totalAmount), values.currency)) {
      toast.error(
        `Insufficient balance for sending to ${items.length} recipients`,
      );
      return;
    }

    setIsLoading(true);
    console.log("Sending to items:", items);

    const rows: Row[] = items.map((item) => ({
      to: item.ownerAddress as string,
      stx: String(values.amount),
      memo: "",
    }));

    const res = await websiteMessenger.sendMessage("tipUsers", {
      rows: rows,
      currency: values.currency,
      senderAddy: address,
      senderXProfile: "iatomic_1",
    });
    console.log("getting res", res);
    const txId = res.txId;
    console.log(txId);

    if (txId && txId !== "") {
      toast.info(
        `Xent ${Number.parseFloat(values.amount)} ${values.currency} successfully to multiple users`,
        {
          richColors: true,
          description: `Transaction ID: ${truncateStr(txId as string)}`,
          duration: 5000,
          action: {
            label: "Open In Explorer",
            onClick: () =>
              window.open(`${EXPLORER_BASE_URL}txid/${txId}?chain=mainnet`),
          },
        },
      );
    } else {
      toast.error("Tx failed");
    }
    setIsLoading(false);

    // setTimeout(() => {
    //   toast.info(
    //     `Xend ${values.amount} ${values.currency} to ${items.length} addresses successful`,
    //   );
    //   setIsLoading(false);
    // }, 1000);
  }

  // Add effect to validate amount when it changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "amount" || name === "currency") {
        const amount = Number.parseFloat(value.amount || "0");
        const totalToSend = amount * items.length;

        const isValid = validateAmount(
          String(totalToSend),
          value.currency || "STX",
        );

        if (!isValid && value.amount && Number.parseFloat(value.amount) > 0) {
          form.setError("amount", {
            type: "manual",
            message: `Insufficient balance for ${items.length} recipients`,
          });
        } else if (form.formState.errors.amount?.type === "manual") {
          form.clearErrors("amount");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, validateAmount, items.length]);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xend Many</DialogTitle>
          <DialogDescription>
            Xend to multiple addresses at once
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-1 flex-wrap flex-row">
          {items.map((item, index) => {
            return (
              <Badge key={index} variant={"outline"}>
                {item.bns}
              </Badge>
            );
          })}
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>STX / sBTC</SelectLabel>
                        <SelectItem value="STX">STX</SelectItem>
                        <SelectItem value="sBTC">sBTC</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Tokens</SelectLabel>
                        <SelectItem
                          value="MEME"
                          disabled={!availableTokens.MEME}
                        >
                          MEME
                        </SelectItem>
                        <SelectItem
                          value="VELAR"
                          disabled={!availableTokens.VELAR}
                        >
                          Velar
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Amount per recipient</FormLabel>
                    <small className="text-muted-foreground">
                      Bal: {currentBalance} {selectedCurrency}
                    </small>
                  </div>
                  <FormControl>
                    <Input placeholder="Enter amount" {...field} />
                  </FormControl>
                  {totalAmount > 0 && (
                    <small className="text-muted-foreground">
                      Total:{" "}
                      {totalAmount.toLocaleString(undefined, {
                        maximumFractionDigits: 6,
                      })}{" "}
                      {selectedCurrency}({items.length} recipients)
                    </small>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                className="gap-3 items-center"
                disabled={
                  isLoading || form.formState.errors.amount !== undefined
                }
              >
                {isLoading && (
                  <Loader
                    className="animate-spin"
                    size={17}
                    strokeWidth={1.25}
                  />
                )}
                Xend to {items.length} recipients
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
