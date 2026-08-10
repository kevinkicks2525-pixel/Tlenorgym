"use client";

export interface AnalyticsData {
  totalPageViews: number;
  uniqueVisitors: number;
  totalProductClicks: number;
  pageViewsByRoute: Record<string, number>;
  productClicksByName: Record<string, number>;
  recentVisits: { path: string; timestamp: string }[];
}

const ANALYTICS_KEY = "tlenorgym_analytics_data";
const VISITOR_SESSION_KEY = "tlenorgym_visitor_token";

export function getAnalyticsData(): AnalyticsData {
  if (typeof window === "undefined") {
    return {
      totalPageViews: 0,
      uniqueVisitors: 0,
      totalProductClicks: 0,
      pageViewsByRoute: {},
      productClicksByName: {},
      recentVisits: [],
    };
  }

  try {
    const saved = localStorage.getItem(ANALYTICS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // fallback
  }

  return {
    totalPageViews: 0,
    uniqueVisitors: 0,
    totalProductClicks: 0,
    pageViewsByRoute: {},
    productClicksByName: {},
    recentVisits: [],
  };
}

export function saveAnalyticsData(data: AnalyticsData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
  } catch {
    // fallback
  }
}

export function trackPageView(path: string) {
  if (typeof window === "undefined" || path.startsWith("/admin")) return;

  const data = getAnalyticsData();

  // Increment total views
  data.totalPageViews = (data.totalPageViews || 0) + 1;

  // Increment route views
  data.pageViewsByRoute[path] = (data.pageViewsByRoute[path] || 0) + 1;

  // Track unique visitor session
  try {
    if (!sessionStorage.getItem(VISITOR_SESSION_KEY)) {
      sessionStorage.setItem(VISITOR_SESSION_KEY, `visitor_${Date.now()}_${Math.random()}`);
      data.uniqueVisitors = (data.uniqueVisitors || 0) + 1;
    }
  } catch {
    // fallback
  }

  // Recent visits log
  const now = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  data.recentVisits = [{ path, timestamp: now }, ...(data.recentVisits || [])].slice(0, 10);

  saveAnalyticsData(data);
}

export function trackProductClick(productName: string) {
  if (typeof window === "undefined") return;

  const data = getAnalyticsData();
  data.totalProductClicks = (data.totalProductClicks || 0) + 1;
  data.productClicksByName[productName] = (data.productClicksByName[productName] || 0) + 1;

  saveAnalyticsData(data);
}
