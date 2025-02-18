// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useEffect, useRef, useState } from 'react';
import intersection from 'lodash/intersection';
import Pagination from '@cloudscape-design/components/pagination';
import Table from '@cloudscape-design/components/table';
import TextFilter from '@cloudscape-design/components/text-filter';
import { COLUMN_DEFINITIONS, DEFAULT_PREFERENCES, Preferences } from './table-config';
import { Breadcrumbs, jobsBreadcrumbs } from '../commons/breadcrumbs'
import { CustomAppLayout, Navigation, Notifications, TableNoMatchState } from '../commons/common-components';
import { FullPageHeader } from './full-page-header';
import { useLocalStorage } from '../commons/use-local-storage';
import {
  getHeaderCounterServerSideText,
  distributionTableAriaLabels,
  getTextFilterCounterServerSideText,
  renderAriaLive,
} from '../../i18n-strings';
import { useColumnWidths } from '../commons/use-column-widths';
import { useDistributions } from './hooks';
import { TopNav } from '../commons/top-nav';
import { remotePost } from '../../common/api-gateway';
import {DeployModelModal} from '../endpoints/create-ed';
import '../../styles/base.scss';

function ServerSideTable({
  columnDefinitions,
  saveWidths,
  loadHelpPanelContent,
  setDisplayNotify,
  setNotificationData
}) {
  const [preferences, setPreferences] = useLocalStorage('ModelHub-JobTable-Preferences', DEFAULT_PREFERENCES);
  const [descendingSorting, setDescendingSorting] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [filteringText, setFilteringText] = useState('');
  const [delayedFilteringText, setDelayedFilteringText] = useState('');
  const [sortingColumn, setSortingColumn] = useState(columnDefinitions[0]);
  const [refresh,setRefresh] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const { pageSize } = preferences;
  const params = {
    pagination: {
      currentPageIndex,
      pageSize,
    },
    sorting: {
      sortingColumn,
      sortingDescending: descendingSorting,
    },
    filtering: {
      filteringText: delayedFilteringText,
    },
    refresh:refresh
  };
  const { items, loading, totalCount, pagesCount, currentPageIndex: serverPageIndex } = useDistributions(params);

  useEffect(() => {
    setSelectedItems(oldSelected => intersection(items, oldSelected));
  }, [items]);

  const onSortingChange = event => {
    setDescendingSorting(event.detail.isDescending);
    setSortingColumn(event.detail.sortingColumn);
  };

  const onClearFilter = () => {
    setFilteringText('');
    setDelayedFilteringText('');
  };

  const onDeploy =()=>{
    setVisible(true);
  }

  const onDelete = () => {
    if (selectedItems[0].job_status === 'RUNNING'){
      setDisplayNotify(true);
      setNotificationData({ status: 'warning', content: `"RUNNING" 状态无法删除，请到SageMaker控制台中停止训练任务。` });
    }else{
      remotePost({job_id:selectedItems[0].job_id},'delete_job').then(res=>{
        console.log(res);
        if (res.response.code === 'SUCCESS'){
          setDisplayNotify(true);
          setRefresh((prev)=>!prev);
          setNotificationData({ status: 'success', content: `删除成功 job id ${selectedItems[0].job_id}` });
        }else{
          setDisplayNotify(true);
          setNotificationData({ status: 'error', content: `${selectedItems[0].job_id}. ${res.response.message}` });
        }
        
      }).catch(err=>{
        setDisplayNotify(true);
        setNotificationData({ status: 'error', content: `删除失败 job id ${selectedItems[0].job_id}` });
      })
    }
  };

  const onRefresh = () => {
    setRefresh((prev)=>!prev);
  };


  return (
    <div>
    {visible&&<DeployModelModal setDisplayNotify={setDisplayNotify} setNotificationData={setNotificationData}
    selectedItems={selectedItems} setVisible={setVisible} visible={visible}/>}

    <Table
      enableKeyboardNavigation={true}
      loading={loading}
      selectedItems={selectedItems}
      items={items}
      onSortingChange={onSortingChange}
      onSelectionChange={event => setSelectedItems(event.detail.selectedItems)}
      sortingColumn={sortingColumn}
      sortingDescending={descendingSorting}
      columnDefinitions={columnDefinitions}
      columnDisplay={preferences.contentDisplay}
      ariaLabels={distributionTableAriaLabels}
      renderAriaLive={renderAriaLive}
      selectionType="single"
      variant="full-page"
      stickyHeader={true}
      resizableColumns={true}
      onColumnWidthsChange={saveWidths}
      wrapLines={preferences.wrapLines}
      stripedRows={preferences.stripedRows}
      contentDensity={preferences.contentDensity}
      stickyColumns={preferences.stickyColumns}
      header={
        <FullPageHeader
          selectedItemsCount={selectedItems.length}
          selectedItems={selectedItems}
          onDelete = {onDelete}
          onDeploy = {onDeploy}
          setNotificationData = {setNotificationData}
          setDisplayNotify = {setDisplayNotify}
          counter={!loading && getHeaderCounterServerSideText(totalCount, selectedItems.length)}
          onInfoLinkClick={loadHelpPanelContent}
          onRefresh={onRefresh}
        />
      }
      loadingText="Loading"
      empty={<TableNoMatchState onClearFilter={onClearFilter} />}
      filter={
        <TextFilter
          filteringText={filteringText}
          onChange={({ detail }) => setFilteringText(detail.filteringText)}
          onDelayedChange={() => setDelayedFilteringText(filteringText)}
          filteringAriaLabel="Filter"
          filteringPlaceholder="Find"
          filteringClearAriaLabel="Clear"
          countText={getTextFilterCounterServerSideText(items, pagesCount, pageSize)}
        />
      }
      pagination={
        <Pagination
          pagesCount={pagesCount}
          currentPageIndex={serverPageIndex}
          disabled={loading}
          onChange={event => setCurrentPageIndex(event.detail.currentPageIndex)}
        />
      }
      preferences={<Preferences preferences={preferences} setPreferences={setPreferences} />}
    />
  </div>
  );
}

function JobTable() {
  const [columnDefinitions, saveWidths] = useColumnWidths('React-JobTable-Widths', COLUMN_DEFINITIONS);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [notificationData, setNotificationData] = useState({});
  const [displayNotify, setDisplayNotify] = useState(false);


  const appLayout = useRef();
  return (
    <div>
      <TopNav />
      <CustomAppLayout
        ref={appLayout}
        navigation={<Navigation activeHref="/jobs" />}
        notifications={<Notifications successNotification={displayNotify} data={notificationData} />}
        breadcrumbs={<Breadcrumbs items={jobsBreadcrumbs} />}
        content={
          <div>
          <ServerSideTable
            setNotificationData={setNotificationData}
            setDisplayNotify={setDisplayNotify}
            columnDefinitions={columnDefinitions}
            saveWidths={saveWidths}
            loadHelpPanelContent={() => {
              setToolsOpen(true);
              appLayout.current?.focusToolsClose();
            }}
          />
          </div>
        }
        contentType="table"
        toolsOpen={toolsOpen}
        onToolsChange={({ detail }) => setToolsOpen(detail.open)}
      />
     
    </div>
  );
}


export default JobTable;

