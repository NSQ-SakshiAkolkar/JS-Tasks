var SA = SA || {};

SA.EventFeedback = (function () {
    "use strict";

    const FIELDS = {
        customerRating: "sa_customerrating",
        feedbackComments: "sa_feedbackcomments",
        followUpRequired: "sa_followuprequired",
        followUpRemarks: "sa_followupremarks"
    };

    const NOTIFICATION_IDS = {
        feedbackComments: "SA_FEEDBACK_COMMENTS"
    };

    function onLoad(executionContext) {
        handleCustomerRatingChange(executionContext);
    }

    function onSave(executionContext) {
        const areFeedbackCommentsValid =
            validateFeedbackComments(executionContext);

        if (!areFeedbackCommentsValid) {
            executionContext
                .getEventArgs()
                .preventDefault();
        }
    }
    function handleCustomerRatingChange(executionContext) {
        const formContext = executionContext.getFormContext();

        const ratingAttribute = formContext.getAttribute(
            FIELDS.customerRating
        );

        const commentsAttribute = formContext.getAttribute(
            FIELDS.feedbackComments
        );

        const commentsControl = formContext.getControl(
            FIELDS.feedbackComments
        );

        if (
            !ratingAttribute ||
            !commentsAttribute ||
            !commentsControl
        ) {
            console.error(
                "Customer Rating or Feedback Comments field was not found. Verify the logical names."
            );

            return;
        }

        const ratingText = getSelectedOptionText(
            ratingAttribute
        ).toLowerCase();

        const commentsRequired =
            ratingText === "1 star" ||
            ratingText === "2 star";

        commentsAttribute.setRequiredLevel(
            commentsRequired ? "required" : "none"
        );

        if (!commentsRequired) {
            commentsControl.clearNotification(
                NOTIFICATION_IDS.feedbackComments
            );
        }
    }
    function validateFeedbackComments(executionContext) {
        const formContext = executionContext.getFormContext();

        const ratingAttribute = formContext.getAttribute(
            FIELDS.customerRating
        );

        const commentsAttribute = formContext.getAttribute(
            FIELDS.feedbackComments
        );

        const commentsControl = formContext.getControl(
            FIELDS.feedbackComments
        );

        if (
            !ratingAttribute ||
            !commentsAttribute ||
            !commentsControl
        ) {
            console.error(
                "Customer Rating or Feedback Comments field was not found. Verify the logical names."
            );

            return true;
        }

        commentsControl.clearNotification(
            NOTIFICATION_IDS.feedbackComments
        );

        const ratingText = getSelectedOptionText(
            ratingAttribute
        ).toLowerCase();

        const commentsValue = commentsAttribute.getValue();

        const commentsRequired =
            ratingText === "1 star" ||
            ratingText === "2 star";

        if (
            commentsRequired &&
            (
                !commentsValue ||
                commentsValue.trim() === ""
            )
        ) {
            commentsAttribute.setRequiredLevel(
                "required"
            );

            commentsControl.setNotification(
                "Feedback Comments is mandatory when Customer Rating is 1 Star or 2 Star.",
                NOTIFICATION_IDS.feedbackComments
            );

            return false;
        }

        return true;
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
    return {
        onLoad: onLoad,
        onSave: onSave,
        handleCustomerRatingChange:
            handleCustomerRatingChange,
        validateFeedbackComments:
            validateFeedbackComments
    };
})();