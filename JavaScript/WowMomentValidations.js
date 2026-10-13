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

    function onLoad(executionContext) {
        const formContext = executionContext.getFormContext();
    }

    function onSave(executionContext) {
        const formContext = executionContext.getFormContext();
    }

    return {
        onLoad: onLoad,
        onSave: onSave
    };
})();