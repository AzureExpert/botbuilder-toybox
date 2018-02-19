/**
 * @module botbuilder-toybox-prompts
 */
/** Licensed under the MIT License. */
import { Promiseable, Activity, Attachment } from 'botbuilder';
import { PromptValidator } from './textPrompt';

/** Prompts the user to upload one or more attachments. */
export interface AttachmentPrompt<O = Attachment[]> {
    /**
     * Sends a formated prompt to the user. 
     * @param context Context for the current turn of conversation.
     * @param prompt Text or activity to send as the prompt.
     * @param speak (Optional) SSML that should be spoken for prompt. The prompts `inputHint` will be automatically set to `expectingInput`.
     */
    prompt(context: BotContext, prompt: string|Partial<Activity>, speak?: string): Promise<void>;

    /**
     * Recognizes and validates the users reply.
     * @param context Context for the current turn of conversation.
     */
    recognize(context: BotContext): Promise<O|undefined>;
}

/**
 * Creates a new prompt that asks the user to upload one or more attachments.
 * @param validator (Optional) validator for providing additional validation logic or customizing the prompt sent to the user when invalid.
 */
export function createAttachmentPrompt<O = Attachment[]>(validator?: PromptValidator<Attachment[], O>): AttachmentPrompt<O> {
    return {
        prompt: function prompt(context, prompt, speak) {
            const msg: Partial<Activity> = typeof prompt === 'string' ? { type: 'message', text: prompt } : Object.assign({}, prompt);
            if (speak) { msg.speak = speak }
            if (!msg.inputHint) { msg.inputHint = 'expectingInput' }
            context.responses.push(msg);
            return Promise.resolve(); 
        },
        recognize: function recognize(context) {
            const values = context.request ? context.request.attachments : undefined;
            return Promise.resolve(validator ? validator(context, values) : values as any);
        }
    };
}
