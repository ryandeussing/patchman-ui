import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import { intl } from '../../Utilities/IntlProvider';
import messages from '../../Messages';
import { filterSelectedActiveSystemIDs } from '../../Utilities/Helpers';
import dateValidator from '../../Utilities/dateValidator';

export const reviewSystemColumns = [{
    key: 'display_name',
    title: 'Name',
    props: {
        width: 50
    }
},
{
    title: 'OS',
    key: 'os',
    props: {
        width: 25
    }
},
{
    key: 'baseline_name',
    title: 'Patch template',
    props: {
        width: 25
    }
}
];

export const configurationFields = [
    {
        name: 'configurationStep',
        component: 'configurationStep'
    },
    {
        name: 'existing_patch_set',
        component: componentTypes.TEXT_FIELD,
        hidden: true
    }
];

export const nameComponent = [{
    name: 'name',
    component: 'nameField',
    validate: [{ type: validatorTypes.REQUIRED }]
}];

export const descriptionComponent = [{
    name: 'description',
    component: 'descriptionField'
}];

export const toDateComponent = [{
    name: 'toDate',
    component: 'toDateField',
    validate: [
        { type: validatorTypes.REQUIRED },
        { type: 'validate-date' }
    ]
}];

export const getWizardTitle = (wizardType) => {
    let wizardTitle = '';

    switch (wizardType) {
        case 'assign':
            wizardTitle = intl.formatMessage(messages.templateTitleAssignSystem);
            break;
        case 'edit':
            wizardTitle = intl.formatMessage(messages.templateEdit);
            break;
        default:
            wizardTitle = intl.formatMessage(messages.templateTitle);
    }

    return wizardTitle;
};

export const schema = (wizardType) =>{
    return ({
        fields: [
            {
                component: componentTypes.WIZARD,
                name: 'patch-set-wizard',
                isDynamic: true,
                inModal: true,
                showTitles: true,
                title: getWizardTitle(wizardType),
                description: intl.formatMessage(messages.templateDescription),
                fields: [
                    {
                        name: 'patch-set-config',
                        title: intl.formatMessage(wizardType === 'edit' ? messages.templateEdit : messages.templateNew),
                        fields: configurationFields,
                        nextStep: 'systems'
                    },
                    {
                        name: 'systems',
                        title: intl.formatMessage(messages.templateSelectSystems),
                        fields: [
                            {
                                name: 'systems',
                                component: 'reviewSystems'
                                //We can use this later in case UX wantes to prevent patch template s without zero systems
                                //validate: [{ type: 'validate-systems' }]
                            }
                        ],
                        nextStep: 'review'
                    },
                    {
                        name: 'review',
                        title: intl.formatMessage(messages.templateReview),
                        fields: [
                            {
                                name: 'review',
                                component: 'reviewPatchSet'
                            }
                        ]
                    }

                ]

            }
        ]
    });
};

export const validatorMapper = {
    'validate-systems': () => (formValueSystems) => {
        const systems = filterSelectedActiveSystemIDs(formValueSystems);

        if (systems === undefined) {
            return;
        }
        else if (systems.length > 0) {
            return;
        } else {
            return intl.formatMessage(messages.templateNoSystemSelected);
        }
    },
    'validate-date': () => dateValidator
};

export const apiFailedNotification = (description) => ({
    title: 'There was an error while processing your request',
    description,
    variant: 'danger'
});
