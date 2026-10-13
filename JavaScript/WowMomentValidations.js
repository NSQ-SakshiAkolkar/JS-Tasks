var SA = SA || {};

SA.WowMoment = (function () {
    "use strict";

    const FIELDS = {
        title: "sa_name",
        firstName: "sa_FirstName",
        lastName: "sa_LastName",
        emailAddress: "sa_EmailAddress",
        mobileNumber: "sa_MobileNumber",
        wowMomentDate: "sa_WowMomentDate",
        occasion: "sa_Occasion",
        shops: "sa_Shops",
        spouseName: "sa_SpouseName",
        managementApproval: "sa_ManagementApproval",
        rejectionRemarks: "sa_RejectionRemarks"
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
            console.error(
                "Email Address column was not found. Check its logical name."
            );

            return true;
        }

        emailControl.clearNotification(
            NOTIFICATION_IDS.email
        );

        const emailValue = emailAttribute.getValue();

        if (!emailValue) {
            return true;
        }

        const normalizedEmail =
            emailValue.trim().toLowerCase();

        if (
            normalizedEmail.endsWith(
                "@nsquarexperts.com"
            )
        ) {
            emailControl.setNotification(
                "Email addresses belonging to @nsquarexperts.com are not allowed.",
                NOTIFICATION_IDS.email
            );

            emailAttribute.setValue(null);

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