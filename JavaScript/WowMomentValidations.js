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
    function onLoad(executionContext) {
        // const formContext = executionContext.getFormContext();
        validateEmail(executionContext);

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

    return {
        onLoad: onLoad,
        onSave: onSave,
        validateEmail: validateEmail
    };
})();