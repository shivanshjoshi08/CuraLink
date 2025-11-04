
import { Button } from "@/components/ui/button";
import { Stethoscope, Users, FlaskConical, Search, Lightbulb, Heart, FileText, Building, MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export default function Home() {
    const heroImage = PlaceHolderImages.find(img => img.id === 'duolingo-style-hero');
    const patientTestimonialAvatar = PlaceHolderImages.find(img => img.id === 'avatar-1');
    const researcherTestimonialAvatar = PlaceHolderImages.find(img => img.id === 'avatar-researcher-testimonial');

    const testimonials = [
        {
            avatar: patientTestimonialAvatar,
            quote: "As a caregiver, navigating my husband's diagnosis was overwhelming. CuraLink's AI summaries of research papers helped me understand his condition and ask smarter questions.",
            author: "Alice Johnson",
            role: "Patient"
        },
        {
            avatar: researcherTestimonialAvatar,
            quote: "Finding collaborators across different institutions used to be a huge challenge. With CuraLink, I connected with two labs in under a month.",
            author: "Dr. Ben Carter",
            role: "Oncologist"
        },
        {
            avatar: PlaceHolderImages.find(img => img.id === 'avatar-2'), // Or another placeholder
            quote: "CuraLink made it simple to find clinical trials for my condition. For the first time, I feel like I can actively contribute to finding a cure.",
            author: "Maria Gomez",
            role: "Caregiver"
        },
    ]

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <header className="px-4 lg:px-6 h-20 flex items-center bg-background sticky top-0 z-50 border-b">
                <Link href="/" className="flex items-center justify-center font-bold text-2xl text-primary" prefetch={false}>
                    <Stethoscope className="h-8 w-8 text-primary" />
                    <span className="ml-2 text-foreground">CuraLink</span>
                </Link>
                <nav className="ml-auto flex items-center gap-2 sm:gap-4">
                    <Button variant="ghost" asChild>
                        <Link href="/login" prefetch={false} className="font-semibold text-lg text-muted-foreground hover:text-primary uppercase tracking-wider">
                            Login
                        </Link>
                    </Button>
                    <Button asChild size="lg" className="text-lg py-6 px-6 font-bold rounded-xl shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Link href="/signup" prefetch={false}>
                            Get Started
                        </Link>
                    </Button>
                </nav>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="w-full py-20 md:py-32 lg:py-40">
                    <div className="container px-4 md:px-6">
                        <div className="grid gap-12 lg:grid-cols-2 lg:gap-24 items-center">
                            <div className="flex flex-col justify-center space-y-6 text-center lg:text-left items-center lg:items-start">
                                <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl max-w-2xl">
                                    The future of medical research is collaborative.
                                </h1>
                                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                    CuraLink connects patients with researchers to accelerate the discovery of treatments and cures.
                                </p>
                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <Button asChild size="lg" className="text-lg py-8 px-10 rounded-xl shadow-lg w-full sm:w-auto">
                                        <Link href="/signup">Start as a Patient</Link>
                                    </Button>
                                    <Button asChild variant="secondary" size="lg" className="text-lg py-8 px-10 rounded-xl shadow-lg w-full sm:w-auto">
                                        <Link href="/signup">Start as a Researcher</Link>
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-center justify-center">
                                {heroImage && <Image
                                    src={heroImage.imageUrl}
                                    alt={heroImage.description}
                                    width={450}
                                    height={450}
                                    className="object-contain"
                                    data-ai-hint={heroImage.imageHint}
                                />}
                            </div>
                        </div>
                    </div>
                </section>

                {/* How it Works Section */}
                <section className="w-full py-20 md:py-32 bg-muted/50">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How It Works</h2>
                            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                A simple, streamlined process for patients and researchers to connect.
                            </p>
                        </div>
                        <div className="mx-auto grid max-w-5xl items-start gap-12 sm:grid-cols-2 md:grid-cols-3 lg:gap-16">
                            <div className="grid gap-2 text-center">
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-background mb-4 shadow-sm">
                                    <Users className="h-10 w-10 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold">1. Create Your Profile</h3>
                                <p className="text-muted-foreground text-lg">
                                    Tell us about your condition or research focus. Our AI helps build your profile instantly.
                                </p>
                            </div>
                            <div className="grid gap-2 text-center">
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-background mb-4 shadow-sm">
                                    <Search className="h-10 w-10 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold">2. Get Matches</h3>
                                <p className="text-muted-foreground text-lg">
                                    CuraLink instantly matches you with relevant clinical trials, publications, or expert collaborators.
                                </p>
                            </div>
                            <div className="grid gap-2 text-center">
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-background mb-4 shadow-sm">
                                    <Heart className="h-10 w-10 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold">3. Connect & Collaborate</h3>
                                <p className="text-muted-foreground text-lg">
                                    Engage with the community, follow experts, and contribute to the future of medicine.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* For Patients Section */}
                <section className="w-full py-20 md:py-32">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Empowering Patients</h2>
                            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                Take an active role in your health journey and contribute to medical science.
                            </p>
                        </div>
                        <div className="mx-auto grid max-w-5xl items-start gap-12 sm:grid-cols-2 md:grid-cols-3 lg:gap-16">
                            <div className="grid gap-2 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                                    <FlaskConical className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold">Find Clinical Trials</h3>
                                <p className="text-muted-foreground">
                                    Discover and understand clinical trials you may be eligible for.
                                </p>
                            </div>
                            <div className="grid gap-2 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                                    <Users className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold">Connect with Experts</h3>
                                <p className="text-muted-foreground">
                                    Follow leading researchers and specialists in your area of interest.
                                </p>
                            </div>
                            <div className="grid gap-2 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                                    <FileText className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold">Access Simplified Research</h3>
                                <p className="text-muted-foreground">
                                    Get AI-powered summaries of complex medical publications.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* For Researchers Section */}
                <section className="w-full py-20 md:py-32 bg-muted/50">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Advancing Research</h2>
                            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                Accelerate your work with powerful tools for collaboration and discovery.
                            </p>
                        </div>
                        <div className="mx-auto grid max-w-5xl items-start gap-12 sm:grid-cols-2 md:grid-cols-3 lg:gap-16">
                            <div className="grid gap-2 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                                    <Users className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold">Find Collaborators</h3>
                                <p className="text-muted-foreground">
                                    Connect with researchers in complementary fields to expand your work.
                                </p>
                            </div>
                            <div className="grid gap-2 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                                    <Building className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold">Manage Clinical Trials</h3>
                                <p className="text-muted-foreground">
                                    Easily add and update your trials to reach a wider audience.
                                </p>
                            </div>
                            <div className="grid gap-2 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                                    <MessageSquare className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold">Engage with Patients</h3>
                                <p className="text-muted-foreground">
                                    Share your expertise and answer questions in community forums.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonial Section */}
                <section className="w-full py-20 md:py-32">
                    <div className="container px-4 md:px-6">
                        <Carousel
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                            className="w-full max-w-4xl mx-auto"
                        >
                            <CarouselContent>
                                {testimonials.map((testimonial, index) => (
                                    <CarouselItem key={index} className="md:basis-1/1">
                                        <div className="p-1">
                                            <div className="mx-auto max-w-3xl text-center space-y-6">
                                                <div className="flex justify-center">
                                                    {testimonial.avatar && <Image
                                                        src={testimonial.avatar.imageUrl}
                                                        alt="Testimonial author"
                                                        width={100}
                                                        height={100}
                                                        className="rounded-full"
                                                        data-ai-hint={testimonial.avatar.imageHint}
                                                    />}
                                                </div>
                                                <blockquote className="text-2xl font-semibold leading-snug lg:text-3xl lg:leading-normal">
                                                    “{testimonial.quote}”
                                                </blockquote>
                                                <div>
                                                    <h4 className="font-bold text-lg">{testimonial.author}</h4>
                                                    <p className="text-md text-muted-foreground">{testimonial.role}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    </div>
                </section>
            </main>

            <footer className="bg-muted/50 border-t">
                <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-8 px-4 md:px-6 sm:flex-row">
                    <p className="text-sm text-muted-foreground">&copy; 2024 CuraLink. All rights reserved.</p>
                    <nav className="flex gap-4 sm:gap-6">
                        <Link href="#" className="text-sm hover:underline underline-offset-4" prefetch={false}>
                            Terms of Service
                        </Link>
                        <Link href="#" className="text-sm hover:underline underline-offset-4" prefetch={false}>
                            Privacy
                        </Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
