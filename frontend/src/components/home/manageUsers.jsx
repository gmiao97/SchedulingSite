import React, { useState, useEffect, forwardRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import {
  Box,
  Grid,
  Backdrop,
  CircularProgress,
} from '@material-ui/core';
import { 
  AddBox,
  Check,
  Clear,
  DeleteOutline,
  ChevronLeft,
  ChevronRight,
  Edit,
  SaveAlt,
  FilterList,
  FirstPage,
  LastPage,
  Search,
  ArrowDownward,
  Remove,
  ViewColumn,
} from '@material-ui/icons';

import axiosInstance from '../../axiosApi';


const useStyles = makeStyles(theme => ({
  table: {
    maxWidth: '100%',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};


export default function ManageUsers(props) {
  const classes = useStyles();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    let response = await axiosInstance.get(`/yoyaku/users/`);
    setUsers(response.data);
  }

  return(
    <div className={classes.table}>
      <MaterialTable 
        title='ユーザー管理'
        icons={tableIcons}
        options={{
          // filtering: true,
          // headerStyle: {
          //   backgroundColor: '#0074D4',
          // }
        }}
        onRowClick={(event, rowData, togglePanel) => togglePanel()}
        detailPanel={rowData => {
          return (
            <StudentDetails data={rowData} />
          )
        }}
        localization={{
          pagination: {
            labelDisplayedRows: '{count}の{from}-{to}',
            labelRowsSelect: '行',
          },
          toolbar: {
            nRowsSelected: '{0}行を選択',
            searchTooltip: '検索',
            searchPlaceholder: '検索',
          },
          header: {
            actions: 'アクション',
          },
          body: {
            emptyDataSourceMessage: 'ユーザーデータがありません',
            deleteTooltip: '削除',
            filterRow: {
                filterTooltip: 'フィルター',
            },
            editRow: {
              deleteText: '削除を確認しますか？'
            },
          },
        }}
        columns={[
          {title: 'ID', field: 'id', type: 'numeric', filtering: false},
          {title: 'ユーザー名', field: 'username', filtering: false},
          {title: 'ユーザータイプ', field: 'user_type'},
          {title: '姓', field: 'last_name', filtering: false},
          {title: '名', field: 'first_name', filtering: false},
          {title: 'メールアドレス', field: 'email', filtering: false},
        ]}
        data={users}
      />
    </div>
  );
}

export function StudentDetails(props) {
  return(
    <Box m={2}>
      <Grid container spacing={2}>
        <Grid item>
          
        </Grid>
      </Grid>
    </Box>
  );
}