import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";

import { API_BASE_URL, CUSTOMER_ID } from "../config/appConfig";

type PaymentCheckoutParams = {
  checkoutUrl: string;
  jobId: string;
};

const SUCCESS_PATTERNS = [/success/i, /paid/i];

const POLL_INTERVAL_MS = 4000;

const PaymentCheckoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { checkoutUrl, jobId } = route.params as PaymentCheckoutParams;
  const [isInitialising, setIsInitialising] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Complete the payment in the secure window.");
  const hasShownSuccessRef = useRef(false);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({ title: "Complete payment" });
    }, [navigation]),
  );

  const clearPollTimeout = () => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  };

  const showSuccess = useCallback(() => {
    if (hasShownSuccessRef.current) {
      return;
    }

    hasShownSuccessRef.current = true;
    setStatusMessage("Payment confirmed");
    clearPollTimeout();

    Alert.alert("Payment confirmed", "Thanks! Your payment has been recorded.", [
      {
        text: "Continue",
        onPress: () => navigation.navigate("Dashboard" as never),
      },
    ]);
  }, [navigation]);

  const pollPaymentStatus = useCallback(async () => {
    if (hasShownSuccessRef.current) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/jobs?role=customer&userId=${encodeURIComponent(CUSTOMER_ID)}`,
      );

      if (response.ok) {
        const jobs = (await response.json()) as { id: string; paymentStatus?: string }[];
        const job = jobs.find((item) => item.id === jobId);

        if (job && job.paymentStatus && job.paymentStatus !== "PENDING") {
          showSuccess();
          return;
        }
      }
    } catch (error) {
      console.warn("Failed to poll payment status", error);
    }

    clearPollTimeout();
    pollTimeoutRef.current = setTimeout(pollPaymentStatus, POLL_INTERVAL_MS);
  }, [jobId, showSuccess]);

  useEffect(() => {
    pollPaymentStatus();

    return () => {
      clearPollTimeout();
    };
  }, [pollPaymentStatus]);

  const handleNavigationChange = useCallback(
    (event: WebViewNavigation) => {
      if (!event?.url || hasShownSuccessRef.current) {
        return;
      }

      if (SUCCESS_PATTERNS.some((pattern) => pattern.test(event.url))) {
        showSuccess();
      }
    },
    [showSuccess],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.statusBanner}>
        <Text style={styles.statusText}>{statusMessage}</Text>
      </View>
      <WebView
        source={{ uri: checkoutUrl }}
        onNavigationStateChange={handleNavigationChange}
        startInLoadingState
        onLoadEnd={() => setIsInitialising(false)}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0275D8" />
            <Text style={styles.loadingText}>Loading checkout…</Text>
          </View>
        )}
      />
      {isInitialising && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#0275D8" />
        </View>
      )}
    </SafeAreaView>
  );
};

export default PaymentCheckoutScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  statusBanner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F2F7FF",
    borderBottomColor: "#D6E4FF",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statusText: {
    color: "#1C1C1E",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4A4A4A",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
});
