/**
 * Copyright since 2007 PrestaShop SA and Contributors
 * PrestaShop is an International Registered Trademark & Property of PrestaShop SA
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Academic Free License 3.0 (AFL-3.0)
 * that is bundled with this package in the file LICENSE.md.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/AFL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * @author    PrestaShop SA <contact@prestashop.com>
 * @copyright Since 2007 PrestaShop SA and Contributors
 * @license   https://opensource.org/licenses/AFL-3.0 Academic Free License 3.0 (AFL-3.0)
 */
// import { SMART_BUTTON_CLASS } from '../../constants/ps-checkout-classes.constants';

export class ExpressButtonCartComponent {
  constructor(checkout) {
    this.checkout = checkout;
    this.checkoutConfig = checkout.config;

    this.htmlElementService = checkout.htmlElementService;
    this.payPalService = checkout.payPalService;
    this.psCheckoutService = checkout.psCheckoutService;

    this.$ = this.checkout.$;

    this.buttonContainer = this.htmlElementService.getCheckoutExpressCartButtonContainer(
      true
    );
  }

  renderPayPalButton() {
    if (
      !this.payPalService
        .getEligibleFundingSources()
        .filter(({ name }) => name === 'paypal').length > 0
    )
      return;

    return this.payPalService
      .getButtonExpress('paypal', {
        onInit: (data, actions) => actions.enable(),
        onClick: (data, actions) =>
          this.psCheckoutService
            // TODO: Move this to constant when ExpressCheckoutButton component is created
            .postCheckCartOrder(
              { ...data, fundingSource: 'paypal', isExpressCheckout: true },
              actions
            )
            // TODO: Error notification
            .catch(() => actions.reject()),
        // TODO: [PAYSHIP-605] Error handling
        onError: (error) => console.error(error),
        onApprove: (data, actions) =>
          this.psCheckoutService.postExpressCheckoutOrder(
            {
              ...data,
              fundingSource: 'paypal',
              isExpressCheckout: true
            },
            actions
          ),
        onCancel: (data) =>
          this.psCheckoutService.postCancelOrder({
            ...data,
            fundingSource: 'paypal',
            isExpressCheckout: true
          }),
        createOrder: (data) =>
          this.psCheckoutService.postCreateOrder({
            ...data,
            fundingSource: 'paypal',
            isExpressCheckout: true
          })
      })
      .render('#ps-checkout-express-button');
  }

  render() {
    if (!this.buttonContainer) return;

    this.checkoutExpressButton = document.createElement('div');
    this.checkoutExpressButton.id = 'ps-checkout-express-button';

    const separatorText = document.createElement('div');
    separatorText.classList.add('ps-checkout-express-separator');
    separatorText.innerText = this.$('express-button.cart.separator');

    this.buttonContainer.append(separatorText);
    this.buttonContainer.append(this.checkoutExpressButton);

    this.renderPayPalButton();
    return this;
  }
}
