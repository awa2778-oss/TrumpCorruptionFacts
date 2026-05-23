import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, List, Scale, BarChart, Gavel, AlertTriangle, FileText, Target, Landmark, Coins, Download, FlaskConical, ExternalLink } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  { title: "Dashboard",               url: "/",                    icon: Home },
  { title: "All Actions",             url: "/actions",             icon: List },
  { title: "Executive Orders",        url: "/executive-orders",    icon: FileText },
  { title: "The Revenge Tour",        url: "/retribution",         icon: Target },
  { title: "Big Beautiful Bill",      url: "/big-bill",            icon: Landmark },
  { title: "Presidential Profiteering", url: "/enrichment",        icon: Coins },
  { title: "Executive Overreach",     url: "/overreach",           icon: AlertTriangle },
  { title: "Supreme Court Cases",     url: "/supreme-court",       icon: Scale },
  { title: "SCOTUS Compare",          url: "/supreme-court/compare", icon: Gavel },
  { title: "Admin Compare",           url: "/compare",             icon: BarChart },
];

const toolItems = [
  { title: "Data Analytics",          url: "/analytics",           icon: FlaskConical },
  { title: "Export to Excel",         url: "/export",              icon: Download },
];

export function AppSidebar() {
  const [location] = useLocation();

  function openFullSite() {
    const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
    const fullUrl = `${window.location.origin}${base}/`;
    window.open(fullUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <Sidebar className="border-r-4 border-border">
      <SidebarHeader className="p-4 border-b-4 border-border bg-primary text-primary-foreground">
        <h2 className="text-3xl tracking-wide uppercase drop-shadow-md">Admin Tracker</h2>
        {/* Desktop / full-site button */}
        <button
          onClick={openFullSite}
          className="mt-2 flex items-center gap-2 w-full px-3 py-1.5 border-2 border-primary-foreground/40 text-primary-foreground/80 hover:border-primary-foreground hover:text-primary-foreground text-xs font-black uppercase tracking-widest transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          Open Full Site ↗
        </button>
      </SidebarHeader>
      <SidebarContent className="p-2 bg-sidebar flex flex-col justify-between">
        <div className="space-y-2">
          <SidebarGroup>
            <SidebarGroupLabel className="font-sans font-bold text-xs uppercase tracking-wider text-muted-foreground">Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={location === item.url || (location.startsWith(item.url) && item.url !== "/")}
                      className="font-bold text-lg uppercase tracking-wide rounded-none border-2 border-transparent hover:border-border hover:bg-accent data-[active=true]:border-border data-[active=true]:bg-primary data-[active=true]:text-primary-foreground transition-all"
                    >
                      <Link href={item.url} className="flex items-center gap-2">
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="font-sans font-bold text-xs uppercase tracking-wider text-muted-foreground">Tools</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {toolItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={location === item.url}
                      className="font-bold text-lg uppercase tracking-wide rounded-none border-2 border-transparent hover:border-border hover:bg-accent data-[active=true]:border-border data-[active=true]:bg-primary data-[active=true]:text-primary-foreground transition-all"
                    >
                      <Link href={item.url} className="flex items-center gap-2">
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        <div className="p-4 border-t-4 border-border mt-auto">
          <ThemeToggle />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
