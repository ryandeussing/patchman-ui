import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import NotificationPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';
import '@redhat-cloud-services/frontend-components-notifications/index.css';
import { RBACProvider } from '@redhat-cloud-services/frontend-components/RBACProvider';
import { changeGlobalTags, changeProfile, globalFilter } from './store/Actions/Actions';
import { mapGlobalFilters } from './Utilities/Helpers';
import { getBaseName } from '@redhat-cloud-services/frontend-components-utilities/helpers';
import './App.scss';
import { Routes } from './Routes';

const App = () => {
    const dispatch = useDispatch();
    const [config, setConfig] = useState({
        selectedTags: [],
        systemProfile: false
    });

    useEffect(() => {
        insights.chrome.init();
        insights.chrome.identifyApp('patch');

        if (insights.chrome?.globalFilterScope) {
            insights.chrome.on('GLOBAL_FILTER_UPDATE', ({ data }) => {
                const SIDs = insights.chrome?.mapGlobalFilter?.(data, false, true)[1];
                const TAGs = insights.chrome?.mapGlobalFilter?.(data)
                ?.filter(item => !item.includes('Workloads'));

                const globalFilterConfig = mapGlobalFilters(TAGs, SIDs, data?.Workloads);

                if (JSON.stringify(config) !== JSON.stringify(globalFilterConfig)) {
                    dispatch(globalFilter(globalFilterConfig));
                    setConfig(globalFilterConfig);
                    dispatch(changeGlobalTags(globalFilterConfig.selectedTags));
                    dispatch(changeProfile(globalFilterConfig.systemProfile));
                }

            });
        }
    }, []);

    return (
        <React.Fragment>
            <NotificationPortal />
            <RBACProvider appName="patch">
                <Router basename={getBaseName(window.location.pathname)}>
                    <Routes />
                </Router>
            </RBACProvider>
        </React.Fragment>
    );
};

export default App;
