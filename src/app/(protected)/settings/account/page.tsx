import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AccountSettingsPage() {
  return (
    <section className="page-section">
      <div className="page-header">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Account settings</h1>
        <p className="text-sm text-muted-foreground">Review account preferences and profile settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Account settings will appear here.</p>
        </CardContent>
      </Card>
    </section>
  )
}
