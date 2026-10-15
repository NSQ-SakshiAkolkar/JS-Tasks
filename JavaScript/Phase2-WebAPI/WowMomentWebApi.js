"use strict";

/**
 * Phase 2 Web API functions for the Wow Moment table.
 */

var SA = window.SA || {};
SA.WowMomentWebApi = SA.WowMomentWebApi || {};
/**
 * Populates Agent Name and Agent Email from the currently logged-in user's System User record.
 */
SA.WowMomentWebApi.populateAgentDetails = function (executionContext) {
    var formContext = executionContext.getFormContext();

    // Form type 1 represents the Create form.
    var formType = formContext.ui.getFormType();

    // Run only when a new Wow Moment record is being created.
    if (formType !== 1) {
        return;
    }

    var agentNameAttribute =
        formContext.getAttribute("sa_agentname");

    var agentEmailAttribute =
        formContext.getAttribute("sa_agentemail");

    // Stop if either column is unavailable on the current form.
    if (!agentNameAttribute || !agentEmailAttribute) {
        console.error(
            "Agent Name or Agent Email column is unavailable on the form."
        );
        return;
    }

    // Get the unique ID of the currently logged-in user.
    var userId =
        Xrm.Utility.getGlobalContext().userSettings.userId;

    // Remove braces from the GUID, if present.
    userId = userId.replace(/[{}]/g, "");

    // Retrieve the current user's full name and internal email address.
    Xrm.WebApi.retrieveRecord(
        "systemuser",
        userId,
        "?$select=fullname,internalemailaddress"
    ).then(
        function success(result) {
            agentNameAttribute.setValue(result.fullname || "");
            agentEmailAttribute.setValue(
                result.internalemailaddress || ""
            );
        },
        function error(error) {
            console.error(
                "Error while retrieving logged-in user: " +
                error.message
            );
        }
    );
};
