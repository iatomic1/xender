import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { SquareKanban } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_BASE_URL } from "@/lib/constants";
import axios from "axios";

type Leaderboard = {
  user: {
    id: string;
    xUsername: string;
    stxAddress: string;
    totalSent: number;
    totalReceived: number;
    createdAt: string;
    updatedAt: string;
  };
  tipStats: {
    currency: string;
    totalReceived: number;
    totalSent: number;
  };
};

interface LeaderboardResponse {
  leaderboard: Leaderboard[];
  success: boolean;
}

const LeaderboardSheet = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("senders");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (isOpen) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await axios.get(`${API_BASE_URL}leaderboard`);
          console.log(response);
          if (!response.data) throw new Error("Failed to fetch leaderboard");
          const data: LeaderboardResponse = await response.data;
          setLeaderboard(data.leaderboard);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "An unknown error occurred",
          );
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchLeaderboard();
  }, [isOpen]);

  const topSenders = [...leaderboard]
    .filter((item) => item.tipStats.totalSent > 0)
    .sort((a, b) => b.tipStats.totalSent - a.tipStats.totalSent);

  const topReceivers = [...leaderboard]
    .filter((item) => item.tipStats.totalReceived > 0)
    .sort((a, b) => b.tipStats.totalReceived - a.tipStats.totalReceived);

  const renderLeaderboardItems = (items: Leaderboard[]) => (
    <div className="space-y-6">
      {items.map((item, index) => (
        <div
          key={item.user.id}
          className="flex items-center space-x-4 bg-secondary/50 p-4 rounded-lg"
        >
          <div className="flex-shrink-0">
            <Badge
              variant="secondary"
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
            >
              {index + 1}
            </Badge>
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-2">
              {item.user.xUsername && (
                <a
                  href={`https://x.com/${item.user.xUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {item.user.xUsername}
                </a>
              )}
            </div>
            <div className="flex space-x-2 text-sm text-muted-foreground">
              {activeTab === "senders" ? (
                <span>Total Sent: {item.tipStats.totalSent} STX</span>
              ) : (
                <span>Total Received: {item.tipStats.totalReceived} STX</span>
              )}
            </div>
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No data available
        </div>
      )}
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full mt-10">
          <SquareKanban size={17} />
        </Button>
      </SheetTrigger>
      <SheetContent
        className="w-[400px] sm:w-[540px] overflow-y-auto"
        side="right"
      >
        <SheetHeader className="pb-6">
          <SheetTitle className="text-2xl font-bold">
            Xender Leaderboard
          </SheetTitle>
          <SheetDescription>
            Top tippers and recipients on Xender
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="text-muted-foreground">Loading leaderboard...</div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-4">{error}</div>
        ) : (
          <Tabs defaultValue="senders" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="senders">Top Senders</TabsTrigger>
              <TabsTrigger value="receivers">Top Receivers</TabsTrigger>
            </TabsList>
            <TabsContent value="senders">
              {renderLeaderboardItems(topSenders)}
            </TabsContent>
            <TabsContent value="receivers">
              {renderLeaderboardItems(topReceivers)}
            </TabsContent>
          </Tabs>
        )}

        <SheetClose asChild>
          <Button
            className="mt-6 w-full"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Close Leaderboard
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
};

export default LeaderboardSheet;
