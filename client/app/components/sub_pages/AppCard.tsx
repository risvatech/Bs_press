// components/app-card.tsx
import  { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { ExternalLink, Smartphone, Globe } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface AppCardProps {
    app: {
        id: number
        title: string
        shortDescription: string
        thumbnailUrl: string
        category: string
        appType: string
        seoSlug: string
        demoUrl?: string
    }
}

export default function AppCard({ app }: AppCardProps) {
    return (
        <Card className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 h-full">
            {/* Background Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
                {/* App Image */}
                <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
                    <Image
                        src={app.thumbnailUrl}
                        alt={app.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                    {/* App Type Badge */}
                    <div className="absolute top-4 left-4">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm ${
                            app.appType === 'Mobile App'
                                ? 'bg-blue-500/20 text-blue-700'
                                : 'bg-purple-500/20 text-purple-700'
                        }`}>
                            {app.appType === 'Mobile App' ? (
                                <Smartphone className="w-3 h-3" />
                            ) : (
                                <Globe className="w-3 h-3" />
                            )}
                            <span className="text-xs font-medium">{app.appType}</span>
                        </div>
                    </div>
                </div>

                {/* Card Content */}
                <CardContent className="p-6">
                    {/* Category Badge */}
                    <div className="mb-4">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full">
              {app.category}
            </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 group-hover:bg-clip-text transition-all duration-300">
                        {app.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 mb-6 line-clamp-3">
                        {app.shortDescription}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Link href={`/apps/${app.seoSlug}`} className="flex-1">
                            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                                View Details
                            </Button>
                        </Link>

                        {app.demoUrl && (
                            <Button
                                variant="outline"
                                className="flex items-center gap-2"
                                onClick={() => window.open(app.demoUrl, '_blank')}
                            >
                                <ExternalLink className="w-4 h-4" />
                                Demo
                            </Button>
                        )}
                    </div>
                </CardContent>
            </div>
        </Card>
    )
}