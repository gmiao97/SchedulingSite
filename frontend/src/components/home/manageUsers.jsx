import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import {
  Typography,
  Box,
  Grid,
} from '@material-ui/core';
import axiosInstance from '../../axiosApi';
import { gradeMappings, tableIcons } from '../../util';


const useStyles = makeStyles(theme => ({
  table: {
    maxWidth: '100%',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  multiline: {
    whiteSpace: 'pre-line',
  },
}));


export default function ManageUsers(props) {
  const classes = useStyles();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    let response = await axiosInstance.get(`/yoyaku/users/`);
    setUsers(response.data.map(user => 
      ({...user, time_zone: user.time_zone.replace('_', ' ')})
    ));
    setLoading(false);
  }

  return(
    <div className={classes.table}>
      <MaterialTable 
        title='ユーザー管理'
        data={users}
        icons={tableIcons}
        isLoading={loading}
        onRowClick={(event, rowData, togglePanel) => togglePanel()}
        detailPanel={rowData => {
          if (rowData.user_type === 'STUDENT') {
            return(
              <StudentDetails data={rowData} />
            )
          } else if (rowData.user_type === 'TEACHER') {
            return(
              <TeacherDetails data={rowData} />
            );
          } else if (rowData.user_type === 'ADMIN') {
            return(
              <AdminDetails data={rowData} />
            );
          } else {
            return null;
          }
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
            editTooltip: '編集',
            editRow: {
              deleteText: '削除を確認しますか？'
            },
          },
        }}
        columns={[
          {title: 'ID', field: 'id', type: 'numeric'},
          {title: 'ユーザー名', field: 'username'},
          {title: '入会日', field: 'date_joined'},
          {title: 'ユーザータイプ', field: 'user_type'},
          {title: 'タイムゾーン', field: 'time_zone'},
          {title: '姓', field: 'last_name'},
          {title: '名', field: 'first_name'},
          {title: 'メールアドレス', field: 'email'},
        ]}
      />
    </div>
  );
}

export function StudentDetails(props) {
  const classes = useStyles();

  return(
    <Box m={2}>
      <Grid container spacing={4} justify='space-around'>
        <Grid item xs={12}>
          <Typography variant='subtitle1' color='textSecondary' display='block' gutterBottom>
            自己紹介
          </Typography>
          <Typography variant='body2' color='textPrimary' display='block' className={classes.multiline} gutterBottom>
            {props.data.description}
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant='subtitle2' color='textSecondary' display='block' gutterBottom>
            保護者電話番号・
            <Typography variant='body2' color='textPrimary' display='inline'>
              {props.data.phone_number}
            </Typography>
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant='subtitle2' color='textSecondary' display='block' gutterBottom>
            生年月日・
            <Typography variant='body2' color='textPrimary' display='inline'>
              {props.data.birthday}
            </Typography>
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant='subtitle2' color='textSecondary' display='block' gutterBottom>
            Stripe顧客ID・
            <Typography variant='body2' color='textPrimary' display='inline'>
              {props.data.stripeCustomerId}
            </Typography>
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant='subtitle2' color='textSecondary' display='block' gutterBottom>
            学校名・
            <Typography variant='body2' color='textPrimary' display='inline'>
              {props.data.student_profile.school_name}
            </Typography>
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant='subtitle2' color='textSecondary' display='block' gutterBottom>
            学年・
            <Typography variant='body2' color='textPrimary' display='inline'>
              {gradeMappings.get(props.data.student_profile.school_grade)}
            </Typography>
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant='subtitle2' color='textSecondary' display='block' gutterBottom>
            紹介者・
            <Typography variant='body2' color='textPrimary' display='inline'>
              {props.data.student_profile.referrer}
            </Typography>
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant='subtitle2' color='textSecondary' display='block' gutterBottom>
            入会費・
            <Typography variant='body2' color='textPrimary' display='inline'>
              {props.data.student_profile.should_pay_signup_fee ? '未払い' : '紹介/支払い済み'}
            </Typography>
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

export function TeacherDetails(props) {
  const classes = useStyles();

  return(
    <Box m={2}>
      <Grid container spacing={4} justify='space-around'>
        <Grid item xs={12}>
          <Typography variant='subtitle1' color='textSecondary' display='block' gutterBottom>
            自己紹介
          </Typography>
          <Typography variant='body2' color='textPrimary' display='block' className={classes.multiline} gutterBottom>
            {props.data.description}
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant='subtitle2' color='textSecondary' display='block' gutterBottom>
            電話番号・
            <Typography variant='body2' color='textPrimary' display='inline'>
              {props.data.phone_number}
            </Typography>
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant='subtitle2' color='textSecondary' display='block' gutterBottom>
            生年月日・
            <Typography variant='body2' color='textPrimary' display='inline'>
              {props.data.birthday}
            </Typography>
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant='subtitle2' color='textSecondary' display='block' gutterBottom>
            所属・
            <Typography variant='body2' color='textPrimary' display='inline'>
              {props.data.teacher_profile.association}
            </Typography>
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

export function AdminDetails(props) {
  const classes = useStyles();

  return(
    <Box m={2}>
      <Grid container spacing={4} justify='space-around'>
        <Grid item xs={12}>
          <Typography variant='subtitle1' color='textSecondary' display='block' gutterBottom>
            自己紹介
          </Typography>
          <Typography variant='body2' color='textPrimary' display='block' className={classes.multiline} gutterBottom>
            {props.data.description}
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant='subtitle2' color='textSecondary' display='block' gutterBottom>
            電話番号・
            <Typography variant='body2' color='textPrimary' display='inline'>
              {props.data.phone_number}
            </Typography>
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant='subtitle2' color='textSecondary' display='block' gutterBottom>
            生年月日・
            <Typography variant='body2' color='textPrimary' display='inline'>
              {props.data.birthday}
            </Typography>
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}