import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            About Medical Messenger
          </h1>
          <p className="text-lg text-gray-600">
            Connecting patients with medical specialists for personalized
            healthcare
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Medical Messenger aims to bridge the gap between patients and
                medical specialists, providing a secure platform for direct
                communication and personalized healthcare consultations. We
                believe that everyone deserves access to quality medical advice
                from verified professionals.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">
                  1. Discover Specialists
                </h3>
                <p className="text-gray-600">
                  Browse our directory of verified medical professionals by
                  specialty, location, and expertise area.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  2. Request Subscription
                </h3>
                <p className="text-gray-600">
                  Send subscription requests to doctors you&apos;d like to
                  communicate with. Doctors can approve or decline based on
                  their availability.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  3. Secure Communication
                </h3>
                <p className="text-gray-600">
                  Once approved, communicate directly with your chosen doctors
                  through our secure messaging platform.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We take your privacy seriously. All communications are
                encrypted, and we follow strict data protection protocols. Your
                health information is never shared without your explicit
                consent, and we comply with all relevant healthcare privacy
                regulations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Have questions or need support? We&apos;re here to help. Reach
                out to our support team for assistance with your account or any
                technical issues.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
