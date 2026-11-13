import {
  Briefcase,
  ClipboardCheck,
  Factory,
  HelpCircle,
  LayoutDashboard,
  PackagePlus,
} from "lucide-react";
import type { NavGroup } from "../../utils/routes";
import type { SidebarNavGroup } from "./procurementSidebarNav";

export function engineerSidebarGroups(groups: NavGroup[], role: string): SidebarNavGroup[] {
  if (role === "engineer") {
    return [
      {
        label: "WORKSPACE",
        items: [
          { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
        ],
      },
      {
        label: "BUSINESS INTAKE",
        items: [
          {
            label: "Technical Review",
            to: "/ecr?filter=technical-review",
            icon: Briefcase,
            childActiveState: true,
            engineerNavigation: true,
          },
        ],
      },
      {
        label: "ENGINEERING CHANGES",
        items: [
          {
            label: "My ECRs",
            to: "/ecr",
            icon: Factory,
            childActiveState: true,
            engineerNavigation: true,
          },
          {
            label: "New ECR",
            to: "/ecr/new",
            icon: PackagePlus,
            childActiveState: true,
            engineerNavigation: true,
          },
          {
            label: "Business Cases",
            to: "/ecr?filter=business-case",
            icon: Briefcase,
            childActiveState: true,
            engineerNavigation: true,
          },
        ],
      },
      {
        label: "Help",
        items: [
          {
            label: "Help",
            to: "/support/help-desk",
            icon: HelpCircle,
          },
        ],
      },
    ];
  }

  if (role === "engineering") {
    return [
      {
        label: "WORKSPACE",
        items: [
          { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
        ],
      },
      {
        label: "BUSINESS INTAKE",
        items: [
          {
            label: "Engineering Approvals",
            to: "/intake/business-cases",
            icon: Briefcase,
            childActiveState: true,
            engineeringManagerNavigation: true,
          },
        ],
      },
      {
        label: "ENGINEERING CHANGES",
        items: [
          {
            label: "Engineering Review",
            to: "/ecr?filter=engineering",
            icon: ClipboardCheck,
            childActiveState: true,
            engineeringManagerNavigation: true,
          },
          {
            label: "All ECRs",
            to: "/ecr",
            icon: Factory,
            childActiveState: true,
            engineeringManagerNavigation: true,
          },
          {
            label: "Business Cases",
            to: "/ecr?filter=business-case",
            icon: Briefcase,
            childActiveState: true,
            engineeringManagerNavigation: true,
          },
        ],
      },
      {
        label: "Help",
        items: [
          {
            label: "Help",
            to: "/support/help-desk",
            icon: HelpCircle,
          },
        ],
      },
    ];
  }

  return groups;
}

