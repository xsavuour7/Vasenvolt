"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BarChart, Brain, Globe, Leaf, Lightbulb, Shield, Sparkles, Zap } from "lucide-react"

const AboutPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-12 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-2 mb-8">
            <Zap className="h-8 w-8" />
            <span className="text-2xl font-bold">VasenVolt</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-2xl">
            Revolutionizing energy monitoring with AI-powered insights for a sustainable future.
          </p>
        </div>
      </header>

      <main className="flex-1 py-12 px-4 md:px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          {/* Our Story Section */}
          <section className="mb-16">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Our Story</h2>
                <p className="text-lg mb-4">
                  VasenVolt was founded in 2021 by a group of passionate climate scientists, energy experts, and AI
                  specialists who shared a common vision: to empower individuals and businesses to make informed energy
                  decisions through advanced technology.
                </p>
                <p className="text-lg mb-4">
                  Our founders recognized that while many people want to reduce their energy consumption and carbon
                  footprint, they often lack the tools and insights to do so effectively. Traditional energy monitoring
                  systems provided basic data but failed to offer actionable intelligence.
                </p>
                <p className="text-lg">
                  This gap inspired the creation of VasenVolt—a sophisticated AI-powered platform that not only tracks
                  energy usage but transforms that data into personalized recommendations and insights that drive real
                  change.
                </p>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 rounded-xl bg-primary/5"></div>
                <img
                  src="/placeholder.svg?height=400&width=600"
                  alt="VasenVolt team"
                  className="relative rounded-lg w-full h-auto shadow-lg"
                />
              </div>
            </div>
          </section>

          {/* AI-Powered Data Section */}
          <section className="mb-16 bg-muted p-8 rounded-xl">
            <h2 className="text-3xl font-bold mb-8 text-center">AI-Powered Energy Insights</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Brain className="mr-2 h-5 w-5 text-primary" />
                  How Our AI Works
                </h3>
                <p className="mb-4">
                  At the core of VasenVolt is our proprietary artificial intelligence system that processes vast amounts
                  of energy consumption data in real-time. Our AI doesn't just collect data—it learns from it.
                </p>
                <p className="mb-4">
                  By analyzing patterns across millions of data points, our system can identify inefficiencies, predict
                  future usage, and generate personalized recommendations that are specifically tailored to your unique
                  energy profile.
                </p>
                <p>
                  The more you use VasenVolt, the smarter it becomes. Our AI continuously refines its understanding of
                  your energy habits, adapting its insights and recommendations to deliver increasingly accurate and
                  valuable information.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-primary" />
                  Benefits of AI-Generated Data
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-2 w-2 rounded-full bg-primary"></div>
                    <p>
                      <span className="font-medium">Unparalleled Accuracy:</span> Our AI algorithms provide energy
                      insights with precision that far exceeds traditional monitoring systems.
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-2 w-2 rounded-full bg-primary"></div>
                    <p>
                      <span className="font-medium">Personalized Recommendations:</span> Receive tailored suggestions
                      based on your specific usage patterns, not generic advice.
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-2 w-2 rounded-full bg-primary"></div>
                    <p>
                      <span className="font-medium">Predictive Analytics:</span> Anticipate future energy needs and
                      potential issues before they occur.
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-2 w-2 rounded-full bg-primary"></div>
                    <p>
                      <span className="font-medium">Continuous Improvement:</span> Our system evolves with your changing
                      energy habits to provide increasingly relevant insights.
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-2 w-2 rounded-full bg-primary"></div>
                    <p>
                      <span className="font-medium">Actionable Intelligence:</span> Transform complex data into clear,
                      actionable steps that drive real energy savings.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Our Mission Section */}
          <section className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg max-w-3xl mx-auto">
                We're on a mission to accelerate the transition to sustainable energy use through innovative technology
                and data-driven insights.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <Leaf className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Environmental Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We're committed to reducing global carbon emissions by helping individuals and businesses optimize
                    their energy consumption. Every kilowatt-hour saved contributes to a healthier planet.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Lightbulb className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Energy Education</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We believe in empowering users with knowledge. Our platform not only provides data but educates
                    users about energy consumption patterns and sustainable practices.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <BarChart className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Data Transparency</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We're committed to making energy data accessible and understandable. By visualizing complex
                    information, we help users make informed decisions about their energy use.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Values Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Values</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="text-center">
                  <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle>Sustainability</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground">
                    We're committed to environmental stewardship in everything we do, from our product development to
                    our office practices.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="text-center">
                  <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle>Innovation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground">
                    We continuously push the boundaries of what's possible with AI and energy monitoring technology.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="text-center">
                  <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle>Integrity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground">
                    We maintain the highest standards of data privacy and ethical AI use, ensuring transparency in all
                    our operations.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="text-center">
                  <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle>Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground">
                    We measure our success by the real-world energy savings and carbon reductions we help our users
                    achieve.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <section>
            <div className="bg-primary text-primary-foreground rounded-xl p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Join Us in Creating a Sustainable Future</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                Experience the power of AI-driven energy insights and start your journey toward more efficient energy
                use today.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/sign-up">Get Started</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  asChild
                >
                  <Link href="/demo">View Demo</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-muted py-8 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} VasenVolt. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default AboutPage 