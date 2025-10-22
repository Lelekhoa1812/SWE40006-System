import { Subscription } from '../database/models/Subscription';

/**
 * Asserts that a user can chat in a specific subscription
 * @param userId - The ID of the user requesting access
 * @param subscriptionId - The ID of the subscription
 * @throws Error if access is denied
 */
export async function assertCanChat(
  userId: string,
  subscriptionId: string
): Promise<void> {
  const subscription = await Subscription.findOne({
    _id: subscriptionId,
    $or: [{ patientId: userId }, { doctorId: userId }],
    status: 'approved',
  });

  if (!subscription) {
    throw new Error(
      'Access denied: Invalid subscription or insufficient permissions'
    );
  }
}

/**
 * Checks if a user can access a subscription (read-only)
 * @param userId - The ID of the user requesting access
 * @param subscriptionId - The ID of the subscription
 * @returns Promise<boolean> - True if user can access the subscription
 */
export async function canAccessSubscription(
  userId: string,
  subscriptionId: string
): Promise<boolean> {
  try {
    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      $or: [{ patientId: userId }, { doctorId: userId }],
    });

    return !!subscription;
  } catch (error) {
    return false;
  }
}

/**
 * Checks if a user can chat in a specific subscription
 * @param userId - The ID of the user requesting access
 * @param subscriptionId - The ID of the subscription
 * @returns Promise<boolean> - True if user can chat in the subscription
 */
export async function canChatInSubscription(
  userId: string,
  subscriptionId: string
): Promise<boolean> {
  try {
    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      $or: [{ patientId: userId }, { doctorId: userId }],
      status: 'approved',
    });

    return !!subscription;
  } catch (error) {
    return false;
  }
}
