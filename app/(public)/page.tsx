import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Hero } from "./_components/Hero";
import { getOptionalSession } from "./_lib/get-optional-session";

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

export default async function Page() {
  const session = await getOptionalSession();
  const isAuthenticated = Boolean(session?.user);

  return (
    <>
      <Hero isAuthenticated={isAuthenticated} />

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
