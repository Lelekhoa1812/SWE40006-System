import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Medical Messenger
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with medical specialists for personalized healthcare.
            Discover and subscribe to doctors by specialty for direct
            communication.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/doctors">Find Doctors</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/about">Learn More</Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card>
            <CardHeader>
              <CardTitle>Find Specialists</CardTitle>
              <CardDescription>
                Browse doctors by specialty and location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Search our directory of verified medical professionals across
                various specialties.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Secure Communication</CardTitle>
              <CardDescription>
                Connect directly with your chosen doctors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Request subscriptions to communicate with doctors for
                personalized medical advice.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy First</CardTitle>
              <CardDescription>
                Your health information is protected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                All communications are encrypted and follow strict privacy
                protocols.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
