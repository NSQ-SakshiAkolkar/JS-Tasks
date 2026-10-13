var SA = SA || {};

SA.WowMoment = (function () {
    "use strict";

    const FIELDS = {
        title: "sa_name",
        firstName: "sa_firstname",
        lastName: "sa_lastname",
        emailAddress: "sa_emailaddress",
        mobileNumber: "sa_mobilenumber",
        wowMomentDate: "sa_wowmomentdate",
        occasion: "sa_occasion",
        shops: "sa_shops",
        spouseName: "sa_spousename",
        managementApproval: "sa_managementapproval",
        rejectionRemarks: "sa_rejectionremarks"
    };
    const NOTIFICATION_IDS = {
        email: "SA_EMAIL_DOMAIN"
    };

    const SHOP_CONFIG = {
        tableLogicalName: "sa_shop",
        eventColumnLogicalName: "sa_eventsorganizedhere"
    };

    function onLoad(executionContext) {
        validateEmail(executionContext);
        configureShopLookup(executionContext);


    }

    function onSave(executionContext) {
        const formContext = executionContext.getFormContext();
    }
    function validateEmail(executionContext) {
        const formContext = executionContext.getFormContext();

        const emailAttribute =
            formContext.getAttribute(FIELDS.emailAddress);

        const emailControl =
            formContext.getControl(FIELDS.emailAddress);

        if (!emailAttribute || !emailControl) {
            formContext.ui.setFormNotification(
                "Email Address field was not found. Verify its logical name.",
                "ERROR",
                "EMAIL_FIELD_NOT_FOUND"
            );

            return false;
        }

        // Clear previous messages before validating again.
        emailControl.clearNotification(
            NOTIFICATION_IDS.email
        );

        formContext.ui.clearFormNotification(
            NOTIFICATION_IDS.email
        );

        const emailValue = emailAttribute.getValue();

        if (!emailValue) {
            return true;
        }

        // Removes beginning/end spaces and ignores letter casing.
        const normalizedEmail =
            emailValue.trim().toLowerCase();

        if (
            normalizedEmail.endsWith(
                "@nsquarexperts.com"
            )
        ) {
            // Clear the invalid email value.
            emailAttribute.setValue(null);

            // Display the error at the top of the form.
            formContext.ui.setFormNotification(
                "Email addresses belonging to @nsquarexperts.com are not allowed. The Email Address has been cleared.",
                "ERROR",
                NOTIFICATION_IDS.email
            );
            return false;
        }
        return true;
    }
    function configureShopLookup(executionContext) {
        const formContext = executionContext.getFormContext();

        const shopControl =
            formContext.getControl(FIELDS.shops);

        if (!shopControl) {
            console.error(
                "Shops lookup was not found. Verify its logical name:",
                FIELDS.shops
            );

            return;
        }

        shopControl.addPreSearch(function () {
            filterShops(formContext);
        });
    }

    function filterShops(formContext) {
        const occasionAttribute =
            formContext.getAttribute(FIELDS.occasion);

        const shopControl =
            formContext.getControl(FIELDS.shops);

        if (!occasionAttribute || !shopControl) {
            console.error(
                "Occasion or Shops field was not found. Verify the logical names."
            );

            return;
        }

        const occasionValue =
            occasionAttribute.getValue();

        if (occasionValue === null) {
            return;
        }

        const filterXml =
            "<filter type='and'>" +
            "<condition attribute='" +
            SHOP_CONFIG.eventColumnLogicalName +
            "' operator='eq' value='" +
            occasionValue +
            "' />" +
            "</filter>";

        shopControl.addCustomFilter(
            filterXml,
            SHOP_CONFIG.tableLogicalName
        );
    } return {
        onLoad: onLoad,
        onSave: onSave,
        validateEmail: validateEmail,
        configureShopLookup: configureShopLookup
    };
})();