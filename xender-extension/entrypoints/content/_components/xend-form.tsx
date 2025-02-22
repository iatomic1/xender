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
import { useMemo, useState } from "react";
import { useEffect } from "react";
import { EXPLORER_BASE_URL, SUPPORTED_TOKENS } from "@/lib/constants";
import { websiteMessenger } from "@/lib/window-messaging";
import { toast } from "sonner";
import { truncateStr } from "@/lib/helpers";
import { Loader } from "lucide-react";

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

const formatBalance = (balance: string, currency: string) => {
  const num = parseInt(balance, 10);
  if (isNaN(num)) return "0";

  const divisor = 1_000_000;
  return (num / divisor).toLocaleString(undefined, {
    maximumFractionDigits: 6,
  });
};

// Helper function to get the raw balance as a number
const getRawBalance = (
  balance: any,
  currency: string,
  SUPPORTED_TOKENS: Record<string, string>,
) => {
  if (!balance) return 0;

  if (currency === "STX" && balance.stx) {
    return parseInt(balance.stx.balance, 10) / 1000000;
  } else if (currency === "sBTC") {
    // If you have sBTC balance, add it here
    return 0;
  } else if (currency === "MEME" && balance.fungible_tokens) {
    const memeKey = `${SUPPORTED_TOKENS.MEME}::MEME`;
    return balance.fungible_tokens[memeKey]?.balance
      ? parseInt(balance.fungible_tokens[memeKey].balance, 10) / 1000000 // Assuming MEME has 6 decimals like STX
      : 0;
  } else if (currency === "VELAR" && balance.fungible_tokens) {
    const velarKey = `${SUPPORTED_TOKENS.VELAR}::velar`;
    return balance.fungible_tokens[velarKey]?.balance
      ? parseInt(balance.fungible_tokens[velarKey].balance, 10) / 1000000 // Assuming VELAR has 6 decimals like STX
      : 0;
  }

  return 0;
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

  // Get the available currencies based on balance
  const availableTokens = useMemo(() => {
    const tokens: Record<string, boolean> = {
      STX: true,
      sBTC: true, // Assuming sBTC is always available, update if needed
    };

    if (balance?.fungible_tokens) {
      // Check MEME availability
      const memeKey = `${SUPPORTED_TOKENS.MEME}::MEME`;
      tokens.MEME =
        !!balance.fungible_tokens[memeKey]?.balance &&
        parseInt(balance.fungible_tokens[memeKey].balance, 10) > 0;

      // Check VELAR availability
      const velarKey = `${SUPPORTED_TOKENS.VELAR}::velar`;
      tokens.VELAR =
        !!balance.fungible_tokens[velarKey]?.balance &&
        parseInt(balance.fungible_tokens[velarKey].balance, 10) > 0;
    }

    return tokens;
  }, [balance]);

  // Get current balance based on selected currency
  const currentBalance = useMemo(() => {
    if (!balance) return "0";

    if (selectedCurrency === "STX" && balance.stx) {
      return formatBalance(balance.stx.balance, "STX");
    } else if (selectedCurrency === "sBTC") {
      // If you have sBTC balance, add it here
      return "0";
    } else if (selectedCurrency === "MEME" && balance.fungible_tokens) {
      const memeKey = `${SUPPORTED_TOKENS.MEME}::MEME`;
      return balance.fungible_tokens[memeKey]?.balance
        ? formatBalance(balance.fungible_tokens[memeKey].balance, "MEME")
        : "0";
    } else if (selectedCurrency === "VELAR" && balance.fungible_tokens) {
      const velarKey = `${SUPPORTED_TOKENS.VELAR}::velar`;
      return balance.fungible_tokens[velarKey]?.balance
        ? formatBalance(balance.fungible_tokens[velarKey].balance, "VELAR")
        : "0";
    }

    return "0";
  }, [selectedCurrency, balance]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
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
          toast.success(
            `Xent ${Number.parseFloat(values.amount)} ${values.currency} successfully to ${username}`,
            {
              richColors: false,
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

        console.log(res, "from xend");

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

  const rawBalance = useMemo(
    () => getRawBalance(balance, selectedCurrency, SUPPORTED_TOKENS),
    [balance, selectedCurrency],
  );

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "amount" || name === "currency") {
        const amount = Number.parseFloat(value.amount || "0");
        if (!isNaN(amount) && amount > rawBalance) {
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
  }, [form, rawBalance]);

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
            Send Tip
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
