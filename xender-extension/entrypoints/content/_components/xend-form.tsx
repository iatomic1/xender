import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { EXPLORER_BASE_URL, SUPPORTED_TOKENS } from "@/lib/constants";
import { websiteMessenger } from "@/lib/window-messaging";
import { toast } from "sonner";
import { truncateStr } from "@/lib/helpers";
import { Loader } from "lucide-react";
import { useTokenBalance } from "@/hooks/useTokenBalance";

type StxSbtcFormProps = {
  isApiCallComplete: boolean;
  receiverStxAddr: string;
  username: string;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  balance: any;
  senderAddy: string;
  receiverXUsername: string;
  senderXUsername: string;
};

const baseFormSchema = z.object({
  currency: z.string(),
  amount: z.string(),
});

type FormValues = z.infer<typeof baseFormSchema>;

export default function XendForm({
  isApiCallComplete,
  receiverStxAddr,
  username,
  setOpen,
  balance,
  senderAddy,
  receiverXUsername,
  senderXUsername,
}: StxSbtcFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Use our custom hook
  const { availableTokens, tokenBalances, validateAmount } = useTokenBalance(
    balance,
    SUPPORTED_TOKENS,
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(
      baseFormSchema.refine(
        (data) => {
          const amount = Number.parseFloat(data.amount);
          return !isNaN(amount) && amount > 0;
        },
        {
          message: "Amount must be a positive number",
          path: ["amount"],
        },
      ),
    ),
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

  async function onSubmit(values: FormValues) {
    if (isApiCallComplete && receiverStxAddr) {
      try {
        setIsLoading(true);
        const res = await websiteMessenger.sendMessage("tipUser", {
          address: receiverStxAddr,
          amount: Number.parseFloat(values.amount),
          currency: values.currency,
          username: username,
          senderAddy,
          senderXProfile: senderXUsername,
          receiverXProfile: receiverXUsername,
        });
        const txId = res.txId;

        if (txId && txId !== "") {
          toast.info(
            `Xent ${Number.parseFloat(values.amount)} ${values.currency} successfully to ${username}`,
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

        setOpen(false);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.error("BNS address not found or API call not complete");
      // You might want to show an error message to the user here
    }
  }

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "amount" || name === "currency") {
        const isValid = validateAmount(
          value.amount || "0",
          value.currency || "STX",
        );

        if (!isValid && value.amount && Number.parseFloat(value.amount) > 0) {
          form.setError("amount", {
            type: "manual",
            message: "Amount exceeds your balance",
          });
        } else if (form.formState.errors.amount?.type === "manual") {
          form.clearErrors("amount");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, validateAmount]);

  return (
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <SelectItem value="MEME" disabled={!availableTokens.MEME}>
                      MEME
                    </SelectItem>
                    <SelectItem value="VELAR" disabled={!availableTokens.VELAR}>
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
                <FormLabel>Amount</FormLabel>
                <small className="text-muted-foreground">
                  Bal: {currentBalance} {selectedCurrency}
                </small>
              </div>
              <FormControl>
                <Input placeholder="Enter amount" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button
            type="submit"
            className="gap-3 items-center"
            disabled={isLoading}
          >
            {isLoading && (
              <Loader className={"animate-spin"} size={17} strokeWidth={1.25} />
            )}
            Xend Tip
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
