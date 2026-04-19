/* eslint-disable @typescript-eslint/no-explicit-any */
// src/controllers/handleShippoWebhook.ts

import { Request, Response } from 'express';
import { Model } from 'mongoose';
import { campaignProductDeliveredEmailBody } from '../mailTemplate/campaignProductDeliveredEmailBody';
import { orderDeliveredEmailBody } from '../mailTemplate/oderDeliveryEmailBody';
import { CampaignOffer } from '../modules/campaignOffer/campaignOffer.model';
import { Order } from '../modules/order/order.model';
import { errorLogger } from '../shared/logger';
import sendEmail from '../utilities/sendResendEmail';
import shippo from '../utilities/shippo';

export const handleShippoWebhook = async (req: Request, res: Response) => {
  try {
    const event = JSON.parse(req.body.toString());

    // -------------------------------------
    // TRANSACTION CREATED
    // -------------------------------------
    console.log('Shippo webhook:', event);
    if (
      event.event === 'transaction_created' &&
      event.data.status === 'SUCCESS'
    ) {
      const transactionId = event.data.object_id;
      const transaction = await shippo.transactions.get(transactionId);

      const shippingUpdate = {
        'shipping.status': 'PURCHASED',
        'shipping.trackingNumber': transaction.trackingNumber,
        'shipping.labelUrl': transaction.labelUrl,
        'shipping.trackingUrl': transaction.trackingUrlProvider,
      };

      const models: { model: Model<any>; label: string }[] = [
        { model: Order, label: 'Order' },
        { model: CampaignOffer, label: 'CampaignOffer' },
      ];

      for (const { model, label } of models) {
        const doc = await model.findOneAndUpdate(
          { 'shipping.shippoTransactionId': transactionId },
          { $set: shippingUpdate },
          { new: true },
        );

        if (doc) {
          console.log(`${label} ${doc._id} updated with shipping info`);
        }
      }
    }

    // TRACK UPDATED
    // if (event.event === 'track_updated') {
    //   const trackingNumber = event.data?.tracking_number;
    //   const status = event.data?.tracking_status?.status;

    //   if (!trackingNumber || !status) {
    //     return res.status(200).send('No tracking info');
    //   }

    //   const models: { model: Model<any>; label: string }[] = [
    //     { model: Order, label: 'Order' },
    //     { model: CampaignOffer, label: 'CampaignOffer' },
    //   ];

    //   for (const { model, label } of models) {
    //     const doc = await model.findOneAndUpdate(
    //       { 'shipping.trackingNumber': trackingNumber },
    //       { $set: { 'shipping.status': status } },
    //       { new: true },
    //     );

    //     if (doc) {
    //       console.log(`${label} ${doc._id} tracking updated to: ${status}`);
    //     }
    //   }
    // }

    if (event.event === 'track_updated') {
      const trackingNumber = event.data?.tracking_number;
      const status = event.data?.tracking_status?.status;

      if (!trackingNumber || !status) {
        errorLogger.error('No tracking information found');
        return res.status(200).send('No tracking info');
      }

      const models: { model: Model<any>; label: string }[] = [
        { model: Order, label: 'Order' },
        { model: CampaignOffer, label: 'CampaignOffer' },
      ];

      for (const { model, label } of models) {
        const doc = await model
          .findOneAndUpdate(
            { 'shipping.trackingNumber': trackingNumber },
            { $set: { 'shipping.status': status } },
            { new: true },
          )
          .populate('reviewer', 'email name');

        if (doc) {
          console.log(`${label} ${doc._id} tracking updated to: ${status}`);

          if (status?.toUpperCase() === 'DELIVERED') {
            try {
              let userEmail = '';
              let html = '';
              let subject = '';

              if (label === 'Order') {
                userEmail = doc?.reviewer?.email;
                subject = 'Your order has been delivered 📦';
                html = orderDeliveredEmailBody(doc?.reviewer?.name);
              }

              if (label === 'CampaignOffer') {
                userEmail = doc?.reviewer?.email;
                subject = 'Your campaign product has been delivered 🎉';
                html = campaignProductDeliveredEmailBody(doc?.reviewer?.name);
              }

              if (userEmail) {
                await sendEmail({
                  email: userEmail,
                  subject,
                  html,
                });

                errorLogger.info(`Email sent to ${userEmail} for ${label}`);
              }
            } catch (error) {
              errorLogger.error(`Email send failed for ${label}: ${error}`);
            }
          }
        }
      }

      return res.status(200).send('ok');
    }
  } catch (err) {
    console.error('Shippo webhook error:', err);
    return res.status(500).send('Webhook handler failed');
  }
};
