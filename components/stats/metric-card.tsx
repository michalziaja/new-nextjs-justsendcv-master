import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUp, ArrowDown, FileSearch, BadgeCheck, Timer, BriefcaseBusiness } from "lucide-react"

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  description: string;
  icon: React.ReactNode;
}

export function MetricCard({ title, value, change, trend, description, icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs flex items-center gap-1 mt-1">
          {trend === "up" ? 
            <span className="text-green-500 flex items-center">
              <ArrowUp className="h-3 w-3" /> {change}
            </span> : 
            <span className="text-red-500 flex items-center">
              <ArrowDown className="h-3 w-3" /> {change}
            </span>
          }
          <span className="text-muted-foreground">{description}</span>
        </p>
      </CardContent>
    </Card>
  )
}

export function MetricCards() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <MetricCard 
        title="Aplikacje wysłane" 
        value="42" 
        change="+8%"
        trend="up"
        description="vs poprzedni okres"
        icon={<FileSearch className="h-4 w-4 text-blue-500" />}
      />
      <MetricCard 
        title="Wskaźnik odpowiedzi" 
        value="28%" 
        change="+5%"
        trend="up"
        description="vs poprzedni okres"
        icon={<BadgeCheck className="h-4 w-4 text-green-500" />}
      />
      <MetricCard 
        title="Czas do odpowiedzi" 
        value="5.2 dni" 
        change="-1.3"
        trend="down"
        description="vs poprzedni okres"
        icon={<Timer className="h-4 w-4 text-orange-500" />}
      />
      <MetricCard 
        title="Skuteczność" 
        value="18%" 
        change="+2%"
        trend="up"
        description="vs poprzedni okres"
        icon={<BriefcaseBusiness className="h-4 w-4 text-purple-500" />}
      />
    </div>
  )
}
