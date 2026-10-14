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
        email: "SA_EMAIL_DOMAIN",
        wowMomentDate: "SA_WOW_MOMENT_DATE",
        firstName: "SA_FIRST_NAME",
        lastName: "SA_LAST_NAME",
        mobileNumber: "SA_MOBILE_NUMBER"

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
        validateWowMomentDate(executionContext);
        validateFirstName(executionContext);
        validateLastName(executionContext);
        validateMobileNumber(executionContext);
    }

    function onSave(executionContext) {
        const isDateValid =
            validateWowMomentDate(
                executionContext
            );
        const isFirstNameValid = validateFirstName(
            executionContext
        );

        const isLastNameValid = validateLastName(
            executionContext
        );
        const isMobileNumberValid = validateMobileNumber(
            executionContext
        );


        if (
            !isDateValid ||
            !isFirstNameValid ||
            !isLastNameValid ||
            !isMobileNumberValid

        ) {

            executionContext
                .getEventArgs()
                .preventDefault();
        }

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
    function validateWowMomentDate(executionContext) {
        const formContext = executionContext.getFormContext();

        const dateAttribute = formContext.getAttribute(
            FIELDS.wowMomentDate
        );

        const dateControl = formContext.getControl(
            FIELDS.wowMomentDate
        );

        if (!dateAttribute || !dateControl) {
            console.error(
                "Wow Moment Date field was not found. Verify its logical name:",
                FIELDS.wowMomentDate
            );

            return true;
        }

        dateControl.clearNotification(
            NOTIFICATION_IDS.wowMomentDate
        );

        const selectedDate = dateAttribute.getValue();

        if (!selectedDate) {
            return true;
        }

        const today = startOfDay(new Date());

        const enteredDate = startOfDay(
            new Date(selectedDate)
        );

        const minimumDate = addDays(today, 2);

        const maximumDate = addDays(today, 180);

        if (
            enteredDate < minimumDate ||
            enteredDate > maximumDate
        ) {
            dateControl.setNotification(
                "Wow Moment Date must be between 2 days and 180 days from the current date.",
                NOTIFICATION_IDS.wowMomentDate
            );

            return false;
        }

        return true;
    }

    function startOfDay(dateValue) {
        return new Date(
            dateValue.getFullYear(),
            dateValue.getMonth(),
            dateValue.getDate()
        );
    }

    function addDays(dateValue, numberOfDays) {
        const result = new Date(dateValue);

        result.setDate(
            result.getDate() + numberOfDays
        );

        return result;
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
    function validateFirstName(executionContext) {
        const formContext = executionContext.getFormContext();

        return validatePersonName(
            formContext,
            FIELDS.firstName,
            "First Name",
            NOTIFICATION_IDS.firstName
        );
    }
    function validateLastName(executionContext) {
        const formContext = executionContext.getFormContext();

        return validatePersonName(
            formContext,
            FIELDS.lastName,
            "Last Name",
            NOTIFICATION_IDS.lastName
        );
    }
    function validatePersonName(
        formContext,
        fieldLogicalName,
        fieldDisplayName,
        notificationId
    ) {
        const nameAttribute = formContext.getAttribute(
            fieldLogicalName
        );

        const nameControl = formContext.getControl(
            fieldLogicalName
        );

        if (!nameAttribute || !nameControl) {
            console.error(
                fieldDisplayName +
                " field was not found. Verify its logical name:",
                fieldLogicalName
            );

            return true;
        }

        nameControl.clearNotification(
            notificationId
        );

        const nameValue = nameAttribute.getValue();

        if (!nameValue) {
            return true;
        }

        const trimmedName = nameValue.trim();

        const namePattern = /^[A-Za-z-]{2,}$/;

        if (!namePattern.test(trimmedName)) {
            nameControl.setNotification(
                fieldDisplayName +
                " must contain at least two characters. Only alphabetic characters and hyphens are allowed.",
                notificationId
            );

            return false;
        }

        if (nameValue !== trimmedName) {
            nameAttribute.setValue(trimmedName);
        }

        return true;
    }
    function validateMobileNumber(executionContext) {
        const formContext = executionContext.getFormContext();

        const mobileAttribute = formContext.getAttribute(
            FIELDS.mobileNumber
        );

        const mobileControl = formContext.getControl(
            FIELDS.mobileNumber
        );

        if (!mobileAttribute || !mobileControl) {
            console.error(
                "Mobile Number field was not found. Verify its logical name:",
                FIELDS.mobileNumber
            );

            return true;
        }

        mobileControl.clearNotification(
            NOTIFICATION_IDS.mobileNumber
        );

        const mobileValue = mobileAttribute.getValue();

        if (!mobileValue) {
            return true;
        }

        const mobilePattern = /^\+91[0-9]{10}$/;

        if (!mobilePattern.test(mobileValue)) {
            mobileControl.setNotification(
                "Mobile Number must start with +91 and contain exactly 10 digits after the country code. Spaces, letters, and other special characters are not allowed.",
                NOTIFICATION_IDS.mobileNumber
            );

            return false;
        }

        return true;
    }
    return {
        onLoad: onLoad,
        onSave: onSave,
        validateEmail: validateEmail,
        configureShopLookup: configureShopLookup,
        handleOccasionChange: handleOccasionChange,
        handleApprovalChange: handleApprovalChange,
        validateWowMomentDate: validateWowMomentDate,
        validateFirstName: validateFirstName,
        validateLastName: validateLastName,
        validateMobileNumber: validateMobileNumber
    };
})();