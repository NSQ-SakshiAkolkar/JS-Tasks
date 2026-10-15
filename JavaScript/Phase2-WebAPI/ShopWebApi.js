"use strict";

/**
 * Phase 2 Web API functions for the Shop table.
 */

var SA = window.SA || {};
SA.ShopWebApi = SA.ShopWebApi || {};

/**
 * Counts the Wow Moment records related to the current Shop and updates the Shop's Event Counter.
 */
SA.ShopWebApi.updateEventCounter = function (executionContext) {
    var formContext = executionContext.getFormContext();

    console.log("Shop Event Counter function started.");

    // Run only on an existing Shop record.
    if (formContext.ui.getFormType() === 1) {
        console.log("New Shop record. Function stopped.");
        return;
    }

    var shopId = formContext.data.entity.getId();

    if (!shopId) {
        console.error("Shop ID is unavailable.");
        return;
    }

    shopId = shopId.replace(/[{}]/g, "");

    /*
     * Replace these with the exact logical names
     * from your environment.
     */
    var wowMomentTableName = "sa_wowmoment";
    var shopLookupName = "sa_shops";
    var eventCounterName = "sa_eventcounter";
    var wowMomentPrimaryId = "sa_wowmomentid";

    var lookupWebApiName =
        "_" + shopLookupName + "_value";

    var query =
        "?$select=" +
        wowMomentPrimaryId +
        "&$filter=" +
        lookupWebApiName +
        " eq " +
        shopId;

    console.log("Shop ID:", shopId);
    console.log("Web API query:", query);

    Xrm.WebApi.retrieveMultipleRecords(
        wowMomentTableName,
        query
    ).then(
        function success(result) {
            var eventCount = result.entities.length;

            console.log(
                "Related Wow Moment count:",
                eventCount
            );

            var eventCounterAttribute =
                formContext.getAttribute(eventCounterName);

            if (!eventCounterAttribute) {
                Xrm.Navigation.openAlertDialog({
                    text:
                        "Event Counter column was not found. " +
                        "Verify its logical name and confirm that " +
                        "the column is present on the Shop form."
                });
                return;
            }

            var currentValue =
                eventCounterAttribute.getValue();

            console.log(
                "Current Event Counter:",
                currentValue
            );

            if (currentValue === eventCount) {
                console.log(
                    "Event Counter is already correct."
                );
                return;
            }

            eventCounterAttribute.setValue(eventCount);
            eventCounterAttribute.setSubmitMode("always");

            formContext.data.save().then(
                function success() {
                    console.log(
                        "Event Counter saved successfully."
                    );
                },
                function error(error) {
                    Xrm.Navigation.openAlertDialog({
                        text:
                            "Shop save failed: " +
                            error.message
                    });
                }
            );
        },
        function error(error) {
            console.error(
                "Retrieve Wow Moments failed:",
                error
            );

            Xrm.Navigation.openAlertDialog({
                text:
                    "Unable to retrieve related Wow Moments: " +
                    error.message
            });
        }
    );
};


