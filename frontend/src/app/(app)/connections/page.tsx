
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { experts } from "@/lib/placeholder-data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { HeartHandshake, MessageCircle, Search } from "lucide-react";
import Link from "next/link";

export default function ConnectionsPage() {
    const connections = experts.slice(0, 4); // Mock connections

    return (
        <div className="container mx-auto p-0">
             <div className="space-y-4 mb-8">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline flex items-center gap-2">
                    <HeartHandshake className="h-8 w-8" />
                    My Network
                </h1>
                <p className="text-muted-foreground md:text-lg">
                    Manage your professional connections and collaborations.
                </p>
                 <div className="relative">
                    <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search connections..."
                        className="pl-8 w-full md:w-1/2 lg:w-1/3 h-11"
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>My Connections ({connections.length})</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {connections.map(expert => {
                         const avatar = PlaceHolderImages.find(img => img.id === expert.avatarId);
                         const userInitials = expert.name.split(' ').map(n => n[0]).join('');

                         return (
                            <div key={expert.id} className="flex items-center justify-between p-4 rounded-lg border">
                                <Link href={`/experts/${expert.id}`} className="flex items-center gap-4 group">
                                    <Avatar>
                                        {avatar && <AvatarImage src={avatar.imageUrl} alt={expert.name} />}
                                        <AvatarFallback>{userInitials}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold group-hover:underline">{expert.name}</h3>
                                        <p className="text-sm text-muted-foreground">{expert.specialty}</p>
                                    </div>
                                </Link>
                                <Button size="sm" variant="outline">
                                    <MessageCircle className="mr-2 h-4 w-4" /> Message
                                </Button>
                            </div>
                         )
                    })}
                </CardContent>
            </Card>
        </div>
    )
}
