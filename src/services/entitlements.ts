import { EntitlementsState, PlanType } from '../types';
import { storage, STORAGE_KEYS } from './storage';

// Trial limits configuration - easy to adjust
const TRIAL_LIMITS = {
  maxAICalls: 5,           // AI usage limited during trial
  maxSessions: 10,         // Session limit during trial
  durationDays: 7          // Trial duration
};

const FREE_LIMITS = {
  maxSessions: 3,          // Very limited for free tier
  maxAICalls: 0            // No AI for free tier
};

const DEFAULT_ENTITLEMENTS: EntitlementsState = {
  plan: 'free',
  trialDurationDays: TRIAL_LIMITS.durationDays,
  usage: {
    aiCalls: 0,
    sessionsCompleted: 0
  }
};

// RevenueCat integration placeholders - ready for future implementation
export const REVENUECAT_PRODUCTS = {
  monthly: 'gymprogressv2_monthly',
  yearly: 'gymprogressv2_yearly'
};

class EntitlementsService {
  private state: EntitlementsState = DEFAULT_ENTITLEMENTS;
  private listeners: (() => void)[] = [];
  private initialized = false;

  // Async initialization required for AsyncStorage
  async init() {
    if (this.initialized) return;

    this.state = await this.loadState();

    // Check trial expiration on init
    if (this.state.plan === 'trial' && this.isTrialExpired()) {
      this.state.plan = 'free';
      await this.saveState();
    }

    this.initialized = true;
  }

  private async loadState(): Promise<EntitlementsState> {
    const stored = await storage.getItem(STORAGE_KEYS.ENTITLEMENTS);
    if (!stored) return { ...DEFAULT_ENTITLEMENTS };
    try {
      return JSON.parse(stored);
    } catch {
      return { ...DEFAULT_ENTITLEMENTS };
    }
  }

  private async saveState() {
    await storage.setItem(STORAGE_KEYS.ENTITLEMENTS, JSON.stringify(this.state));
    this.notify();
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getState(): EntitlementsState {
    return { ...this.state };
  }

  public getLimits() {
    return {
      trial: TRIAL_LIMITS,
      free: FREE_LIMITS
    };
  }

  // --- ACTIONS ---

  public async startTrial() {
    if (this.state.plan !== 'free') return;

    this.state.plan = 'trial';
    this.state.trialStartDate = Date.now();
    this.state.usage = { aiCalls: 0, sessionsCompleted: 0 };
    await this.saveState();
  }

  public async activatePro() {
    this.state.plan = 'pro';
    await this.saveState();
  }

  public async resetToFree() {
    this.state.plan = 'free';
    this.state.trialStartDate = undefined;
    await this.saveState();
  }

  // --- REVENUECAT INTEGRATION STUBS ---

  /**
   * Initiates in-app purchase via RevenueCat
   * In production, use react-native-purchases
   */
  public async initiatePurchase(planType: 'monthly' | 'yearly'): Promise<{ success: boolean; error?: string }> {
    const productId = planType === 'monthly' ? REVENUECAT_PRODUCTS.monthly : REVENUECAT_PRODUCTS.yearly;

    // TODO: Implementar con RevenueCat
    // import Purchases from 'react-native-purchases';
    // try {
    //   const { customerInfo } = await Purchases.purchaseProduct(productId);
    //   if (customerInfo.entitlements.active['pro']) {
    //     await this.activatePro();
    //     return { success: true };
    //   }
    // } catch (e) {
    //   return { success: false, error: e.message };
    // }

    console.log('[RevenueCat] Initiating purchase:', productId);

    // Simular compra exitosa para desarrollo
    await this.activatePro();
    return { success: true };
  }

  /**
   * Restore purchases from App Store/Play Store
   */
  public async restorePurchases(): Promise<{ success: boolean; hasPro: boolean }> {
    // TODO: Implementar con RevenueCat
    // import Purchases from 'react-native-purchases';
    // const { customerInfo } = await Purchases.restorePurchases();
    // const hasPro = customerInfo.entitlements.active['pro'] !== undefined;

    console.log('[RevenueCat] Restoring purchases...');
    return { success: true, hasPro: this.state.plan === 'pro' };
  }

  // --- CHECKS ---

  public isTrialExpired(): boolean {
    if (this.state.plan !== 'trial' || !this.state.trialStartDate) return false;

    const now = Date.now();
    const expiry = this.state.trialStartDate + (this.state.trialDurationDays * 24 * 60 * 60 * 1000);
    return now > expiry;
  }

  public canUseAI(): { allowed: boolean; reason?: 'paywall_required' | 'trial_expired'; remaining?: number } {
    if (this.state.plan === 'pro') return { allowed: true };

    if (this.state.plan === 'trial') {
      if (this.isTrialExpired()) {
        this.state.plan = 'free';
        this.saveState(); // Fire and forget
        return { allowed: false, reason: 'trial_expired' };
      }
      const remaining = TRIAL_LIMITS.maxAICalls - this.state.usage.aiCalls;
      if (remaining <= 0) {
        return { allowed: false, reason: 'paywall_required', remaining: 0 };
      }
      return { allowed: true, remaining };
    }

    return { allowed: false, reason: 'paywall_required', remaining: 0 };
  }

  public canCreateSession(): { allowed: boolean; reason?: 'paywall_required' | 'trial_expired'; remaining?: number } {
    if (this.state.plan === 'pro') return { allowed: true };

    if (this.state.plan === 'trial') {
      if (this.isTrialExpired()) {
        this.state.plan = 'free';
        this.saveState();
        return { allowed: false, reason: 'trial_expired' };
      }
      const remaining = TRIAL_LIMITS.maxSessions - this.state.usage.sessionsCompleted;
      if (remaining <= 0) {
        return { allowed: false, reason: 'paywall_required', remaining: 0 };
      }
      return { allowed: true, remaining };
    }

    const remaining = FREE_LIMITS.maxSessions - this.state.usage.sessionsCompleted;
    if (remaining <= 0) {
      return { allowed: false, reason: 'paywall_required', remaining: 0 };
    }
    return { allowed: true, remaining };
  }

  public async recordUsage(type: 'ai' | 'session') {
    if (type === 'ai') this.state.usage.aiCalls++;
    if (type === 'session') this.state.usage.sessionsCompleted++;
    await this.saveState();
  }

  public getTrialDaysRemaining(): number {
    if (this.state.plan !== 'trial' || !this.state.trialStartDate) return 0;
    const now = Date.now();
    const expiry = this.state.trialStartDate + (this.state.trialDurationDays * 24 * 60 * 60 * 1000);
    const diff = expiry - now;
    if (diff <= 0) return 0;
    return Math.ceil(diff / (24 * 60 * 60 * 1000));
  }

  public getUsageStats() {
    const limits = this.state.plan === 'trial' ? TRIAL_LIMITS : FREE_LIMITS;
    return {
      aiCalls: {
        used: this.state.usage.aiCalls,
        max: this.state.plan === 'pro' ? Infinity : limits.maxAICalls,
        remaining: this.state.plan === 'pro' ? Infinity : Math.max(0, limits.maxAICalls - this.state.usage.aiCalls)
      },
      sessions: {
        used: this.state.usage.sessionsCompleted,
        max: this.state.plan === 'pro' ? Infinity : (this.state.plan === 'trial' ? TRIAL_LIMITS.maxSessions : FREE_LIMITS.maxSessions),
        remaining: this.state.plan === 'pro' ? Infinity : Math.max(0, (this.state.plan === 'trial' ? TRIAL_LIMITS.maxSessions : FREE_LIMITS.maxSessions) - this.state.usage.sessionsCompleted)
      }
    };
  }
}

export const entitlementsService = new EntitlementsService();
