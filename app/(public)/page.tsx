"use client";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface IFeatureProps {
  title: string;
  description: string;
  icon: string;
}

const features: IFeatureProps[] = [
  {
    title: "Wide Range of Courses",
    description:
      "Explore a diverse selection of courses across various subjects and disciplines.",
    icon: "📚",
  },
  {
    title: "Expert Instructors",
    description:
      "Learn from industry experts and experienced educators who are passionate about teaching.",
    icon: "👩‍🏫",
  },
  {
    title: "Flexible Learning",
    description:
      "Access course materials anytime, anywhere, and learn at your own pace.",
    icon: "⏰",
  },
  {
    title: "Interactive Content",
    description:
      "Engage with multimedia content, quizzes, and assignments to enhance your learning experience.",
    icon: "🎥",
  },
  {
    title: "Community Support",
    description:
      "Join a vibrant community of learners to share knowledge, collaborate, and grow together.",
    icon: "🤝",
  },
  {
    title: "Certification",
    description:
      "Earn certificates upon course completion to showcase your achievements and skills.",
    icon: "🎓",
  },
];

export default function Page() {
  return (
    <>
      <section className="relative pb-20 pt-24">
        <div className="flex flex-col items-center text-center space-y-8">
          <Badge>The feature of online education</Badge>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Elevate your learning journey with our cutting-edge online education
            platform!
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Discover new way to learn, connect, and grow with us.
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            <Link href="/courses" className={buttonVariants({ size: "lg" })}>
              Explore Courses
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 sm:gap-4 md:gap-6 xl:gap-8">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="hover:shadow-lg transition-shadow duration-300"
          >
            <CardHeader>
              <div className="text-4xl mb-4">{feature.icon}</div>

              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  );
}
