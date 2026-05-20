"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { PageHeader } from "@/components/shared/PageHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useAdminSettings, useAdminUpdateSettings } from "@/hooks/useAdmin";
import { siteSettingsSchema, type SiteSettingsInput } from "@/schemas/admin.schema";

export default function AdminSettingsPage() {
  const settings = useAdminSettings();
  const update = useAdminUpdateSettings();

  const form = useForm<SiteSettingsInput>({
    resolver: zodResolver(siteSettingsSchema),
    values: settings.data
      ? {
          appName: settings.data.appName,
          logoUrl: settings.data.logoUrl ?? "",
          supportEmail: settings.data.supportEmail,
          maintenanceMode: settings.data.maintenanceMode,
          primaryColor: settings.data.primaryColor,
        }
      : { appName: "", logoUrl: "", supportEmail: "", maintenanceMode: false, primaryColor: "#2563eb" },
  });

  const previewColor = form.watch("primaryColor");

  // Live preview: apply the primary color as a CSS var on this page only.
  useEffect(() => {
    if (!previewColor) return;
    const root = document.documentElement;
    const prev = root.style.getPropertyValue("--color-primary");
    root.style.setProperty("--color-primary", previewColor);
    return () => {
      root.style.setProperty("--color-primary", prev);
    };
  }, [previewColor]);

  return (
    <div className="w-full space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Site settings"
        description="Branding, support contact, and maintenance toggle."
      />

      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>How Vaultline presents itself to users.</CardDescription>
        </CardHeader>
        <CardContent>
          {settings.isPending ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-1/2" />
            </div>
          ) : (
            <Form {...form}>
              <form
                className="space-y-5"
                onSubmit={form.handleSubmit((v) => update.mutate(v))}
                noValidate
              >
                <FormField
                  control={form.control}
                  name="appName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>App name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="supportEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Support email</FormLabel>
                      <FormControl><Input type="email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary brand colour</FormLabel>
                      <div className="flex items-center gap-3">
                        <FormControl>
                          <Input
                            type="color"
                            className="h-10 w-16 cursor-pointer p-1"
                            {...field}
                          />
                        </FormControl>
                        <Input
                          className="font-mono tabular-nums"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="#2563eb"
                        />
                        <span
                          className="h-10 w-10 rounded-md border border-border"
                          style={{ background: field.value }}
                          aria-hidden
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Live preview applied to this page.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maintenanceMode"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                        <div>
                          <Label className="font-medium">Maintenance mode</Label>
                          <p className="text-xs text-muted-foreground">
                            When enabled, only admins can sign in.
                          </p>
                        </div>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("maintenanceMode") ? (
                  <Alert variant="warning">
                    <AlertDescription>
                      Maintenance mode is on — non-admin users will see a service banner.
                    </AlertDescription>
                  </Alert>
                ) : null}

                <Button type="submit" loading={update.isPending}>Save settings</Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
