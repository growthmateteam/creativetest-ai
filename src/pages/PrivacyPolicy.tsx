import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Mail, ExternalLink } from "lucide-react";

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Privacy Policy | CreativeTest.Ai";
  }, []);

  const sections = [
    {
      id: "introduction",
      title: "1. Introduction",
      content: (
        <>
          <p className="mb-4">
            CreativeTest.Ai (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is operated by Growth Mate LLC.
          </p>
          <p className="mb-4">
            This Privacy Policy explains how we collect, use, and protect your information when you use our platform (the &ldquo;Service&rdquo;), including when you connect third-party accounts such as Facebook (Meta) and Google.
          </p>
          <p>By using CreativeTest.Ai, you agree to this Privacy Policy.</p>
        </>
      ),
    },
    {
      id: "information-collected",
      title: "2. Information We Collect",
      content: (
        <>
          <h4 className="font-semibold text-foreground mb-2">a. Information You Provide</h4>
          <ul className="list-disc list-inside space-y-1 mb-6 text-muted-foreground">
            <li>Name</li>
            <li>Email address</li>
            <li>Business information</li>
            <li>Billing information (if applicable)</li>
          </ul>

          <h4 className="font-semibold text-foreground mb-2">b. Facebook (Meta) Data</h4>
          <p className="mb-3">
            When you connect your Facebook account, we access data only with your explicit permission via:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-3 text-muted-foreground">
            <li><span className="font-medium text-foreground">ads_management</span> → create, edit, and manage ads</li>
            <li><span className="font-medium text-foreground">ads_read</span> → read performance data</li>
            <li><span className="font-medium text-foreground">business_management</span> → access business assets and ad accounts</li>
          </ul>
          <p className="mb-2">This may include:</p>
          <ul className="list-disc list-inside space-y-1 mb-6 text-muted-foreground">
            <li>Ad account IDs</li>
            <li>Campaigns, ad sets, ads</li>
            <li>Performance metrics (clicks, impressions, conversions, spend)</li>
          </ul>

          <h4 className="font-semibold text-foreground mb-2">c. Google Account Data (Google Sign-In)</h4>
          <p className="mb-2">When you sign in using Google, we may collect:</p>
          <ul className="list-disc list-inside space-y-1 mb-3 text-muted-foreground">
            <li>Your name</li>
            <li>Email address</li>
            <li>Google account identifier</li>
          </ul>
          <p className="mb-2">We use this information only for:</p>
          <ul className="list-disc list-inside space-y-1 mb-3 text-muted-foreground">
            <li>Authentication</li>
            <li>Account creation and login</li>
          </ul>
          <p className="mb-6">
            We do not access Gmail, Google Drive, or other Google data unless explicitly stated and authorized.
          </p>

          <h4 className="font-semibold text-foreground mb-2">d. Google Ads Data (if connected)</h4>
          <p className="mb-2">If you connect a Google Ads account, we may access:</p>
          <ul className="list-disc list-inside space-y-1 mb-3 text-muted-foreground">
            <li>Campaign, ad group, and ad data</li>
            <li>Performance metrics (clicks, impressions, conversions, spend)</li>
            <li>Account-level configuration data</li>
          </ul>
          <p className="mb-2">This data is used strictly to:</p>
          <ul className="list-disc list-inside space-y-1 mb-6 text-muted-foreground">
            <li>Manage and optimize ad campaigns</li>
            <li>Provide analytics and reporting</li>
            <li>Improve platform performance</li>
          </ul>

          <h4 className="font-semibold text-foreground mb-2">e. Usage Data</h4>
          <p className="mb-2">We automatically collect:</p>
          <ul className="list-disc list-inside space-y-1 mb-6 text-muted-foreground">
            <li>IP address</li>
            <li>Device and browser type</li>
            <li>App usage behavior</li>
          </ul>

          <h4 className="font-semibold text-foreground mb-2">f. Cookies & Tracking Technologies</h4>
          <p className="mb-2">We use cookies and similar technologies to:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Improve functionality</li>
            <li>Analyze usage</li>
            <li>Enhance user experience</li>
          </ul>
        </>
      ),
    },
    {
      id: "how-we-use",
      title: "3. How We Use Your Information",
      content: (
        <>
          <p className="mb-2">We use your data to:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Provide and operate CreativeTest.Ai</li>
            <li>Launch, manage, and optimize ad campaigns (Facebook & Google)</li>
            <li>Analyze performance and provide insights</li>
            <li>Authenticate users (Google Sign-In)</li>
            <li>Improve our platform</li>
            <li>Communicate with you</li>
            <li>Ensure security and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>
        </>
      ),
    },
    {
      id: "fb-google-data",
      title: "4. How We Use Facebook and Google Data",
      content: (
        <>
          <p className="mb-2">We use data from Facebook (Meta) and Google strictly to:</p>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>Provide core platform functionality</li>
            <li>Manage advertising campaigns</li>
            <li>Deliver reporting and analytics</li>
          </ul>
          <p className="mb-2 font-semibold">We do not:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Sell platform data</li>
            <li>Use it for unrelated advertising</li>
            <li>Share it outside necessary service providers</li>
          </ul>
        </>
      ),
    },
    {
      id: "data-sharing",
      title: "5. Data Sharing and Disclosure",
      content: (
        <>
          <p className="mb-4">We do not sell your personal information.</p>
          <p className="mb-2">We may share data with:</p>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>Cloud hosting providers</li>
            <li>Analytics providers</li>
            <li>Payment processors</li>
            <li>Legal authorities if required</li>
          </ul>
          <p>All providers are required to protect your data.</p>
        </>
      ),
    },
    {
      id: "data-retention",
      title: "6. Data Retention & Deletion",
      content: (
        <>
          <p className="mb-4">We retain data only as long as necessary to provide the Service.</p>
          <p className="mb-2">You may request deletion at any time:</p>
          <p className="mb-4 font-medium">support@growthmate.agency</p>
          <p className="mb-2">Upon request, we will:</p>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>Delete your personal data</li>
            <li>Remove stored Facebook and Google Ads data</li>
            <li>Disconnect linked accounts</li>
          </ul>
          <p className="mb-2">You may also revoke access via:</p>
          <ul className="space-y-2">
            <li>
              Facebook:{" "}
              <a
                href="https://www.facebook.com/settings?tab=applications"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                facebook.com/settings <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>
              Google:{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                myaccount.google.com/permissions <ExternalLink className="h-3 w-3" />
              </a>
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "security",
      title: "7. Data Security",
      content: (
        <>
          <p className="mb-4">We implement reasonable safeguards to protect your data.</p>
          <p>However, no system is completely secure.</p>
        </>
      ),
    },
    {
      id: "rights",
      title: "8. Your Rights",
      content: (
        <>
          <p className="mb-2">You may:</p>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>Access your data</li>
            <li>Request deletion or correction</li>
            <li>Revoke third-party permissions</li>
            <li>Opt out of communications</li>
          </ul>
          <p>Contact: <span className="font-medium">support@growthmate.agency</span></p>
        </>
      ),
    },
    {
      id: "platform-compliance",
      title: "9. Third-Party Platform Compliance",
      content: (
        <>
          <h4 className="font-semibold text-foreground mb-2">Facebook (Meta)</h4>
          <p className="mb-4">
            We comply with Meta Platform Terms and Developer Policies.{" "}
            <a
              href="https://www.facebook.com/privacy/policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Meta Privacy Policy <ExternalLink className="h-3 w-3" />
            </a>
          </p>

          <h4 className="font-semibold text-foreground mb-2">Google</h4>
          <p>
            Our use of information received from Google APIs will adhere to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Google API Services User Data Policy <ExternalLink className="h-3 w-3" />
            </a>
            , including the Limited Use requirements.
          </p>
        </>
      ),
    },
    {
      id: "third-party",
      title: "10. Third-Party Services",
      content: (
        <>
          <p className="mb-2">We use third-party services for:</p>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>Hosting</li>
            <li>Analytics</li>
            <li>Authentication (Google)</li>
            <li>Advertising platform integrations</li>
          </ul>
          <p>Each has its own privacy policies.</p>
        </>
      ),
    },
    {
      id: "children",
      title: "11. Children\u2019s Privacy",
      content: <p>CreativeTest.Ai is not intended for individuals under 13.</p>,
    },
    {
      id: "changes",
      title: "12. Changes to This Policy",
      content: (
        <p>
          We may update this Privacy Policy. Changes will be reflected by the &ldquo;Last Updated&rdquo; date.
        </p>
      ),
    },
    {
      id: "contact",
      title: "13. Contact Information",
      content: (
        <div className="space-y-2">
          <p className="font-semibold">Growth Mate LLC</p>
          <p>2028 E Ben White Blvd STE 240 PMB 3670</p>
          <p>Austin, TX 78741</p>
          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <a href="mailto:support@growthmate.agency" className="text-primary hover:underline">
              support@growthmate.agency
            </a>
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last Updated: April 21, 2026</p>
        </div>

        {/* Content */}
        <Card className="bg-card border-border">
          <CardContent className="p-8">
            <div className="space-y-8">
              {sections.map((section, index) => (
                <div key={section.id}>
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    {section.title}
                  </h2>
                  <div className="text-muted-foreground leading-relaxed">
                    {section.content}
                  </div>
                  {index < sections.length - 1 && (
                    <Separator className="mt-8 bg-border" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>
            Questions about this Privacy Policy? Contact us at{" "}
            <a href="mailto:support@growthmate.agency" className="text-primary hover:underline">
              support@growthmate.agency
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
