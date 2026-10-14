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
        handleOccasionChange(executionContext, false);
        handleApprovalChange(executionContext);
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
    }
    function handleOccasionChange(executionContext, clearExistingShop) {
        const formContext = executionContext.getFormContext();

        const occasionAttribute =
            formContext.getAttribute(FIELDS.occasion);

        const shopAttribute =
            formContext.getAttribute(FIELDS.shops);

        const shopControl =
            formContext.getControl(FIELDS.shops);

        if (
            !occasionAttribute ||
            !shopAttribute ||
            !shopControl
        ) {
            console.error(
                "Occasion or Shops field was not found. Verify the logical names."
            );

            return;
        }

        const occasionValue = occasionAttribute.getValue();

        const occasionText = getSelectedOptionText(
            occasionAttribute
        );

        const isWeddingShoot =
            occasionText.toLowerCase() === "wedding shoot";

        setSpouseNameBehavior(
            formContext,
            isWeddingShoot
        );

        /*
         * Clear an existing Shop when Occasion is changed.
         * This prevents a Shop belonging to the old Occasion
         * from remaining selected.
         */
        if (clearExistingShop === true) {
            shopAttribute.setValue(null);
        }

        /*
         * If Occasion is empty:
         * 1. Clear Shops
         * 2. Lock Shops
         */
        if (occasionValue === null) {
            shopAttribute.setValue(null);
            shopControl.setDisabled(true);

            return;
        }

        /*
         * If Occasion has a value:
         * Unlock Shops so the user can select a filtered Shop.
         */
        shopControl.setDisabled(false);
    }
    function setSpouseNameBehavior(
        formContext,
        isWeddingShoot
    ) {
        const spouseAttribute =
            formContext.getAttribute(
                FIELDS.spouseName
            );

        const spouseControl =
            formContext.getControl(
                FIELDS.spouseName
            );

        if (!spouseAttribute || !spouseControl) {
            console.error(
                "Spouse Name field was not found. Verify its logical name:",
                FIELDS.spouseName
            );

            return;
        }

        /*
         * Show only for Wedding Shoot.
         */
        spouseControl.setVisible(
            isWeddingShoot
        );

        /*
         * Make mandatory only for Wedding Shoot.
         */
        spouseAttribute.setRequiredLevel(
            isWeddingShoot
                ? "required"
                : "none"
        );

        /*
         * Clear outdated value when Occasion
         * is not Wedding Shoot.
         */
        if (!isWeddingShoot) {
            spouseAttribute.setValue(null);
        }
    }
    function getSelectedOptionText(attribute) {
        if (
            !attribute ||
            attribute.getValue() === null
        ) {
            return "";
        }

        const selectedOption =
            attribute.getSelectedOption();

        if (
            !selectedOption ||
            !selectedOption.text
        ) {
            return "";
        }

        return selectedOption.text.trim();
    }
    function handleApprovalChange(executionContext) {
        const formContext =
            executionContext.getFormContext();

        const approvalAttribute =
            formContext.getAttribute(
                FIELDS.managementApproval
            );

        if (!approvalAttribute) {
            console.error(
                "Management Approval field was not found. Verify its logical name:",
                FIELDS.managementApproval
            );

            return;
        }

        const approvalText =
            getSelectedOptionText(
                approvalAttribute
            ).toLowerCase();

        const shouldLockFields =
            approvalText === "initiated" ||
            approvalText === "approved" ||
            approvalText === "rejected";

        setEventFieldsLocked(
            formContext,
            shouldLockFields
        );

        /*
         * When approval is blank, restore the normal
         * Occasion and Shops behavior.
         */
        if (!shouldLockFields) {
            handleOccasionChange(
                executionContext,
                false
            );
        }
    }

    function setEventFieldsLocked(
        formContext,
        shouldLock
    ) {
        const fieldsToLock = [
            FIELDS.title,
            FIELDS.firstName,
            FIELDS.lastName,
            FIELDS.emailAddress,
            FIELDS.mobileNumber,
            FIELDS.wowMomentDate,
            FIELDS.occasion,
            FIELDS.shops,
            FIELDS.spouseName
        ];

        fieldsToLock.forEach(function (fieldName) {
            const attribute =
                formContext.getAttribute(
                    fieldName
                );

            if (!attribute) {
                console.warn(
                    "Field was not found and could not be locked:",
                    fieldName
                );

                return;
            }

            /*
             * Lock every control connected to the column.
             * This also handles columns displayed more than
             * once on the form.
             */
            attribute.controls.forEach(
                function (control) {
                    control.setDisabled(
                        shouldLock
                    );
                }
            );
        });
    }

    return {
        onLoad: onLoad,
        onSave: onSave,
        validateEmail: validateEmail,
        configureShopLookup: configureShopLookup,
        handleOccasionChange: handleOccasionChange,
        handleApprovalChange: handleApprovalChange
    };
})();