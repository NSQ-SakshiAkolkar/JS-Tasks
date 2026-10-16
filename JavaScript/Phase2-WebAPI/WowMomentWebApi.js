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


// Check Contact by Email
// Purpose:
// 1.itch Search Contact by Email Address
// 2. If Contact exists -> Populate Contact lookup
// 3. If Contact does not exist -> Create Contact
// 4. Populate Contact lookup with newly created Contact
// =====================================================
 
SA.WowMomentWebApi.checkOrCreateContact = function (executionContext) {
 
    // Get current form
    var formContext = executionContext.getFormContext();
 
    // Get values from Wow Moment form
    var firstName = formContext.getAttribute("sa_firstname").getValue();
    var lastName = formContext.getAttribute("sa_lastname").getValue();
    var email = formContext.getAttribute("sa_emailaddress").getValue();
    var mobile = formContext.getAttribute("sa_mobilenumber").getValue();
 
    // Stop if Email is blank
    if (!email) {
        return;
    }
 
    // =====================================================
    // Search Contact by Email Address
    // =====================================================
 
    Xrm.WebApi.retrieveMultipleRecords(
        "contact",
        "?$select=contactid,fullname,emailaddress1&$filter=emailaddress1 eq '" + email + "'"
    ).then(
 
        function success(result) {
 
            // =====================================================
            // Existing Contact Found
            // =====================================================
 
            if (result.entities.length > 0) {
 
                // Get first matching contact
                var existingContact = result.entities[0];
 
                // Create lookup object
                var contactLookup = [{
                    id: existingContact.contactid,
                    name: existingContact.fullname,
                    entityType: "contact"
                }];
 
                // Populate Contact lookup
                formContext.getAttribute("sa_contact").setValue(contactLookup);
            }
 
            // =====================================================
            // Contact Not Found
            // =====================================================
 
            else {
 
                // Data for new Contact record
                var contactData = {
 
                    firstname: firstName,
 
                    lastname: lastName,
 
                    emailaddress1: email,
 
                    mobilephone: mobile
                };
 
                // Create new Contact
                Xrm.WebApi.createRecord(
                    "contact",
                    contactData
                ).then(
 
                    function (createResult) {
 
                        // Get newly created Contact
                        Xrm.WebApi.retrieveRecord(
                            "contact",
                            createResult.id,
                            "?$select=fullname"
                        ).then(
 
                            function (newContact) {
 
                                // Create lookup object
                                var contactLookup = [{
                                    id: createResult.id,
                                    name: newContact.fullname,
                                    entityType: "contact"
                                }];
 
                                // Populate Contact lookup
                                formContext.getAttribute("sa_contact").setValue(contactLookup);
                            }
                        );
                    },
 
                    function (error) {
                        console.log(error.message);
                    }
                );
            }
        },
 
        function (error) {
            console.log(error.message);
        }
    );
};
 

// /**
//  * Populates the Contact lookup on the Wow Moment form.
//  */
// function setContactLookup(
//     contactAttribute,
//     contactId,
//     contactName
// ) {
//     var cleanContactId =
//         contactId.replace(/[{}]/g, "");

//     var lookupValue = [
//         {
//             id: cleanContactId,
//             name: contactName,
//             entityType: "contact"
//         }
//     ];

//     contactAttribute.setValue(lookupValue);
// }