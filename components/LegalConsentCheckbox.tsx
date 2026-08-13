import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import { LEGAL_EFFECTIVE_DATE, PRIVACY_POLICY, TERMS_OF_SERVICE } from "../constants/legal";
import { colors } from "../theme";
import { Modal } from "./Modal";

type LegalDoc = "terms" | "privacy";

type LegalConsentCheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
};

function LegalDocumentBody({ doc }: { doc: LegalDoc }) {
  const sections = doc === "terms" ? TERMS_OF_SERVICE : PRIVACY_POLICY;
  const title = doc === "terms" ? "Terms of Service" : "Privacy Policy";

  return (
    <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator>
      <Text className="mb-3 text-caption text-secondary">
        Effective date: {LEGAL_EFFECTIVE_DATE}
      </Text>
      {sections.map((section) => (
        <View key={section.title} className="mb-4">
          <Text className="mb-1 text-body font-semibold text-text">{section.title}</Text>
          <Text className="text-body leading-6 text-secondary">{section.body}</Text>
        </View>
      ))}
      <Text className="mb-2 text-caption text-secondary">
        Full {title} for CatCal.
      </Text>
    </ScrollView>
  );
}

export function LegalConsentCheckbox({
  checked,
  onCheckedChange,
  className = "",
}: LegalConsentCheckboxProps) {
  const [openDoc, setOpenDoc] = useState<LegalDoc | null>(null);

  return (
    <>
      <View className={`flex-row items-start ${className}`}>
        <Pressable
          onPress={() => onCheckedChange(!checked)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
          accessibilityLabel="I agree to the Terms of Service and Privacy Policy"
          className="mr-3 mt-0.5 h-6 w-6 items-center justify-center rounded-md border-2 active:opacity-80"
          style={{
            borderColor: checked ? colors.primary : colors.border,
            backgroundColor: checked ? colors.primary : "transparent",
          }}
        >
          {checked ? <Check size={14} color={colors.white} strokeWidth={3} /> : null}
        </Pressable>

        <View className="min-w-0 flex-1 flex-row flex-wrap items-center">
          <Text className="text-caption leading-5 text-secondary">I agree to the </Text>
          <Pressable
            onPress={() => setOpenDoc("terms")}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Read Terms of Service"
          >
            <Text className="text-caption font-semibold text-primary">Terms of Service</Text>
          </Pressable>
          <Text className="text-caption leading-5 text-secondary"> and </Text>
          <Pressable
            onPress={() => setOpenDoc("privacy")}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Read Privacy Policy"
          >
            <Text className="text-caption font-semibold text-primary">Privacy Policy</Text>
          </Pressable>
          <Text className="text-caption leading-5 text-secondary">.</Text>
        </View>
      </View>

      <Modal
        visible={openDoc === "terms"}
        title="Terms of Service"
        onClose={() => setOpenDoc(null)}
      >
        <LegalDocumentBody doc="terms" />
      </Modal>

      <Modal
        visible={openDoc === "privacy"}
        title="Privacy Policy"
        onClose={() => setOpenDoc(null)}
      >
        <LegalDocumentBody doc="privacy" />
      </Modal>
    </>
  );
}
