interface CourseHeaderProps {
  title: string;
  smallDesc: string;
}

export function CourseHeader({ title, smallDesc }: CourseHeaderProps) {
  return (
    <div className="space-y-3">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
        {title}
      </h1>
      <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
        {smallDesc}
      </p>
    </div>
  );
}
