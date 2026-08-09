import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthBackground, Card, NavigationBar } from "../components";
import { APP_NAME } from "../constants";
import { LEGAL_EFFECTIVE_DATE, LegalSection } from "../constants/legal";
import { useResponsiveLayout } from "../theme";

type LegalDocumentScreenProps = {
  title: string;
  sections: LegalSection[];
};

export function LegalDocumentScreen({
  title,
  sections,
}: LegalDocumentScreenProps) {
  const router = useRouter();
  const { horizontalPadding, scrollBottomPadding, contentMaxWidth } =
    useResponsiveLayout();

  return (
    <AuthBackground>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View
          style={{
            paddingHorizontal: horizontalPadding,
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
          }}
        >
          <NavigationBar title={title} onBack={() => router.back()} />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingBottom: scrollBottomPadding,
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
          }}
          showsVerticalScrollIndicator={false}
        >
          <Card padding="md" className="mb-6 border border-border/60">
            <Text className="text-title font-semibold text-text">{title}</Text>
            <Text className="mt-2 text-caption text-secondary">
              Effective date: {LEGAL_EFFECTIVE_DATE}
            </Text>
            <Text className="mt-4 text-body leading-6 text-secondary">
              Please read this document carefully. It applies to your use of{" "}
              {APP_NAME}.
            </Text>
          </Card>

          {sections.map((section) => (
            <Card
              key={section.title}
              padding="md"
              className="mb-4 border border-border/60"
            >
              <Text className="mb-3 text-body font-semibold text-text">
                {section.title}
              </Text>
              <Text className="text-body leading-6 text-secondary">
                {section.body}
              </Text>
            </Card>
          ))}
        </ScrollView>
      </SafeAreaView>
    </AuthBackground>
  );
}
