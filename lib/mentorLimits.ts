/**
 * Shared constants for the ask-a-mentor flow.
 *
 * Lives outside lib/actions/mentors.ts because that file is a "use server"
 * module, and those may only export async functions — a plain exported const
 * there is a build error.
 */

/**
 * Two questions a week per member.
 *
 * Enough to ask what you actually need; few enough that five volunteers can
 * keep up. It also raises the quality of what gets asked: people stop firing
 * off six half-thoughts and write the one thing they really want to know.
 * Enforced in the database as well as here.
 */
export const WEEKLY_QUESTION_LIMIT = 2;
