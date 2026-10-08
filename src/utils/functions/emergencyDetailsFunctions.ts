export const emergencyDetailsMessageTitles = {
    1: "## Emergency details: Situation",
    2: "## Emergency details: Location",
    3: "## Emergency details: Players",
    4: "## Emergency details: Remarks",
    skipped: "## Emergency details: Skipped",
} as const;

export type EmergencyDetailsStep = 1 | 2 | 3 | 4;

const legacyBundledSituationLocationMarker = "_The client type of location is:_";

export interface EmergencyDetailsMessage {
    senderId: string;
    contents: string;
}

export interface EmergencyDetailsHistoryPage {
    data: EmergencyDetailsMessage[];
    paginationToken: string | null;
}

export interface EmergencyDetailsProgress {
    completedSteps: EmergencyDetailsStep[];
    skipped: boolean;
}

/** Prefixes the visible step data with the stable key used to restore progress. */
export function createEmergencyDetailsStepMessage(step: EmergencyDetailsStep, contents: string): string {
    return `${emergencyDetailsMessageTitles[step]}\n\n${contents}`;
}

/** Records that the client deliberately declined the optional detail form. */
export function createSkippedEmergencyDetailsMessage(): string {
    return `${emergencyDetailsMessageTitles.skipped}\n\n_The client chose not to provide additional emergency details._`;
}

/**
 * Maps the client-authored emergency-detail messages back to stepper state.
 *
 * Chat messages are the durable record, so this intentionally relies on
 * stable, non-localized Markdown headings rather than browser storage.
 */
export function getEmergencyDetailsProgress(
    messages: EmergencyDetailsMessage[],
    clientId: string,
): EmergencyDetailsProgress {
    const clientMessages = messages.filter(message => message.senderId === clientId);
    const hasLegacyBundledSituation = clientMessages.some(message =>
        message.contents.startsWith(emergencyDetailsMessageTitles[1])
        && message.contents.includes(legacyBundledSituationLocationMarker),
    );
    const completedSteps = ([1, 2, 3, 4] as EmergencyDetailsStep[])
        .filter(step =>
            clientMessages.some(message => message.contents.startsWith(emergencyDetailsMessageTitles[step]))
            || (step === 2 && hasLegacyBundledSituation),
        );
    const skipped = completedSteps.length === 0
        && clientMessages.some(message => message.contents.startsWith(emergencyDetailsMessageTitles.skipped));

    return {
        completedSteps,
        skipped,
    };
}

/** Prevents a second skipped audit message once the first one is persisted. */
export function canSendSkippedEmergencyDetailsMessage(progress: EmergencyDetailsProgress): boolean {
    return !progress.skipped;
}

/** Loads the complete paginated conversation before restoring stepper state. */
export async function loadEmergencyDetailsProgress(
    fetchPage: (paginationToken?: string) => Promise<EmergencyDetailsHistoryPage>,
    clientId: string,
): Promise<EmergencyDetailsProgress> {
    const messages: EmergencyDetailsMessage[] = [];
    const seenPaginationTokens = new Set<string>();
    let paginationToken: string | undefined;

    while (true) {
        const page = await fetchPage(paginationToken);
        messages.push(...page.data);
        const nextPaginationToken = page.paginationToken ?? undefined;

        if (!nextPaginationToken || seenPaginationTokens.has(nextPaginationToken))
            break;

        seenPaginationTokens.add(nextPaginationToken);
        paginationToken = nextPaginationToken;
    }

    return getEmergencyDetailsProgress(messages, clientId);
}
