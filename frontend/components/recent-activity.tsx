import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Activity = {
  id: string
  user: {
    name: string
    avatar: string
  }
  action: string
  file: string
  time: string
}

const activities: Activity[] = [
  {
    id: "1",
    user: {
      name: "Alex",
      avatar: "/placeholder-user.jpg",
    },
    action: "downloaded",
    file: "Project Proposal.pdf",
    time: "2 hours ago",
  },
  {
    id: "2",
    user: {
      name: "Sam",
      avatar: "/placeholder-user.jpg",
    },
    action: "shared",
    file: "Design Assets.zip",
    time: "Yesterday",
  },
  {
    id: "3",
    user: {
      name: "Taylor",
      avatar: "/placeholder-user.jpg",
    },
    action: "commented on",
    file: "Team Photo.jpg",
    time: "3 days ago",
  },
  {
    id: "4",
    user: {
      name: "You",
      avatar: "/placeholder-user.jpg",
    },
    action: "uploaded",
    file: "Product Roadmap.pdf",
    time: "1 week ago",
  },
]

export function RecentActivity() {
  return (
    <Card className="bg-secondary/30">
      <CardContent className="p-0">
        <div className="divide-y divide-border/40">
          {activities.map((activity) => (
            <div key={activity.id} className="p-4">
              <div className="flex items-start">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                  <AvatarFallback>{activity.user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm">
                    <span className="font-medium">{activity.user.name}</span> {activity.action}{" "}
                    <span className="font-medium">{activity.file}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

