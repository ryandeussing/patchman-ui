import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { fetchIDs } from './api';
import { toggleAllSelectedAction } from '../store/Actions/Actions';
import { isObject } from './Helpers';

export const ID_API_ENDPOINTS = {
    advisories: '/ids/advisories',
    systems: '/ids/systems',
    templates: '/baselines',
    advisorySystems: (advisoryID) => `/ids/advisories/${advisoryID}/systems`,
    systemAdvisories: (systemID) => `/ids/systems/${systemID}/advisories`,
    packageSystems: (packageName) => `/packages/${packageName}/systems`,
    systemPackages: (systemID) => `/systems/${systemID}/packages`
};

const useFetchAllIDs = (
    endpoint,
    apiResponseTransformer
) =>
    useCallback((queryParams) =>
        fetchIDs(endpoint, { ...queryParams, limit: -1 })
        .then(response =>
            apiResponseTransformer ? apiResponseTransformer(response) : response
        ),
    []
    );

const useCreateSelectedRow = (transformKey, constructFilename) =>
    useCallback((rows, toSelect = []) => {
        const { ids, data } = rows;
        const shouldUseOnlyIDs = Array.isArray(ids);
        const items = shouldUseOnlyIDs ? ids : data;

        items.forEach((item) => {
            const id = shouldUseOnlyIDs ? item : item.id;

            //expanded rows does not have ID and should be disabled for selection
            if (!(isObject(item) && item.isExpandedRow)) {
                toSelect.push(
                    {
                        id: transformKey ? transformKey(item) : id,
                        selected: constructFilename ? constructFilename(item) : id
                    }
                );
            }
        });

        return toSelect;
    });

const createSelectors = (
    createSelectedRow,
    dispatchSelection,
    toggleAllSystemsSelected
) => {
    const selectNone = (rows) => {
        const toSelect = [];
        Object.keys(rows).forEach(id => {
            toSelect.push(
                {
                    id,
                    selected: false
                }
            );
        });

        dispatchSelection(toSelect);
        toggleAllSystemsSelected(false);
    };

    const selectPage = (pageRows) => {
        if (Array.isArray(pageRows)) {
            pageRows = pageRows.filter(row => !row.disableCheckbox);
        }

        dispatchSelection(createSelectedRow({ data: pageRows }));
    };

    const selectAll = (fetchIDs, queryParams) => {
        return fetchIDs(queryParams).then(response => {
            dispatchSelection(createSelectedRow(response));
            toggleAllSystemsSelected(true);
        });
    };

    return { selectNone, selectPage, selectAll };
};

export const useOnSelect = (rawData, selectedRows, config) => {
    const {
        endpoint,
        queryParams,
        selectionDispatcher,
        constructFilename,
        transformKey,
        apiResponseTransformer,
        //TODO: get rid of this custom selector
        customSelector
    } = config;

    const dispatch = useDispatch();
    const fetchIDs = useFetchAllIDs(endpoint, apiResponseTransformer);
    const createSelectedRow = useCreateSelectedRow(transformKey, constructFilename);

    const toggleAllSystemsSelected = (flagState) => {
        dispatch(toggleAllSelectedAction(flagState));
    };

    const dispatchSelection = (toSelect) => {
        console.log(toSelect, 'toSelect');
        if (customSelector) {
            customSelector(toSelect);
        } else {
            dispatch(selectionDispatcher(toSelect));
        }
    };

    const { selectNone, selectPage, selectAll } = createSelectors(
        createSelectedRow,
        dispatchSelection,
        toggleAllSystemsSelected
    );

    const onSelect = useCallback(
        async (event, selected, rowId, setBulkLoading = () => {}) => {
            switch (event) {
                case 'none': {
                    selectNone(selectedRows);
                    break;
                }

                case 'page': {
                    selectPage(rawData);
                    break;
                }

                case 'all': {
                    selectAll(fetchIDs, queryParams)
                    .then(() => setBulkLoading(false));
                    break;
                }

                default: {
                    dispatchSelection([{
                        id: transformKey ? transformKey(rawData[rowId]) : rawData[rowId].id,
                        selected: selected && (constructFilename ? constructFilename(rawData[rowId]) : true)
                    }]);
                }
            }
        });

    return onSelect;
};
