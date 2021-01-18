import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import { tableIcons } from '../../util';
import axiosInstance from '../../axiosApi';
import {  
  Grid,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link as MaterialLink,
  Button,
} from '@material-ui/core';


const useStyles = makeStyles(theme => ({
  table: {
    minWidth: 500,
  },
  sectionEnd: {
    marginBottom: theme.spacing(2),
  },
  printout: {
    width: '100%',
    border: 0,
    height: 400,
  },
  timetable: {
    width: '100%',
    border: 0,
    height: 200,
  }
}));


export default function ClassInfo(props) {
  const classes = useStyles();
  const [classInfo, setClassInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const showContent = props.currentUser.user_type !== 'STUDENT' || props.currentUser.stripeSubscriptionProvision;

  useEffect(() => {
    getClassInfo();
  }, []);

  const getClassInfo = async () => {
    let response = await axiosInstance.get(`/yoyaku/class-info/`);
    setClassInfo(response.data);
    setLoading(false);
  }

  const createData = (name, link, meetingId, password) => ({name, link, meetingId, password});
  let rows = [];
  if (showContent) {
    rows = rows.concat([
      createData('通常フリーレッスン（月～金）', 'https://us04web.zoom.us/j/79135219967?pwd=QkNldG4zK1FXUFI4ZFZyZGJhRHNyQT09', '791 3521 9967', '5656'),
      createData('フリーレッスン中学生', 'https://us04web.zoom.us/j/76278477003?pwd=Y3J1L0xjdFJCeFZLNGhjaDBhdXQ0UT09', '762 7847 7003', '5656'),
      createData('初心者クラス', 'https://us02web.zoom.us/j/83515032396?pwd=dkNIeWI5QTVaU3JxL1h2TXYwa0xzUT09', '835 1503 2396', '121212'),
    ]);
    if (props.currentUser.user_type !== 'STUDENT' || props.currentProduct.name.includes('未就学児')) {
      rows.push(createData('未就学児クラス', 'https://us04web.zoom.us/j/73881305403?pwd=YXRWakVQYTNGS21SeXJnK3pXWXI1UT09', '738 8130 5403', '5656'));
    }
    if (props.currentUser.user_type !== 'STUDENT' || props.currentProduct.name.includes('土日')) {
      rows.push(createData('土日クラス', 'https://us04web.zoom.us/j/75710108047?pwd=VlBIY3RjcFpPOVlIczMrY0VmMnBNUT09', '757 1010 8047', '5656'));
    }
  }

  const rules = [
    'ZOOMの名前を、自分の名前に設定しましょう。',
    '参加するときは、ビデオをオンにしましょう。',
    '見学のときは、名前を『見学・○○（なまえ）』に変えましょう。',
    '先生の許可なしに、お話をするのはやめましょう。',
    '他のお友達の迷惑になるような事は、やめましょう。注意してもやめないときは、退出してもらう場合があります。',
  ];

  return(
    <div>
      <Typography variant='h6' display='block' color='primary' gutterBottom>クラスのルール</Typography>
      {rules.map(line => 
        <Typography key={line} variant='body1' color='textSecondary'>{line}</Typography>
      )}
      <Typography display='block' variant='caption' color='textSecondary' gutterBottom>何かご事情がある場合は保護者の方からご相談下さい。info@mercy-education.com</Typography>
      <Typography variant='h6' display='block' color='primary' gutterBottom>時間割り</Typography>
      <Paper elevation={24}>
        <Box p={3}>
          <iframe className={classes.timetable} src="https://drive.google.com/embeddedfolderview?id=1z5WUmx_lFVRy3YbmtEUH-tIqrwsaP8au#list">
            <Button variant='contained' className={classes.sectionEnd} color='secondary' href='https://drive.google.com/drive/u/0/folders/1z5WUmx_lFVRy3YbmtEUH-tIqrwsaP8au' 
            target='_blank' rel='noopener noreferrer'>
              時間割り
            </Button>
          </iframe>
        </Box>
      </Paper>
      <Typography variant='h6' display='block' color='primary'>ZOOM ID</Typography>
      <Typography variant='subtitle1' display='block' color='primary'>日本時間　今月2日～来月1日</Typography>
      <Typography variant='subtitle1' display='block' color='primary'>アメリカ　今月1日～今月末日</Typography>
      {showContent ? 
        <MaterialTable 
          title='ZOOM情報'
          data={classInfo}
          isLoading={loading}
          icons={tableIcons}
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
              emptyDataSourceMessage: 'ZOOM情報がありません',
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
            {title: 'ID', field: 'id', hidden: true},
            {title: 'レッスン', field: 'name', filtering: false},
            {title: 'リンク', field: 'link', filtering: false},
            {title: 'ミーティングID', field: 'meeting_id', filtering: false},
            {title: 'パスワード', field: 'password', filtering: false},
          ]}
          editable={props.currentUser.user_type === 'ADMIN' ? 
            {
              onRowAdd: newData => axiosInstance.post(`/yoyaku/class-info/`, newData).then(getClassInfo),
              onRowUpdate: newData => axiosInstance.put(`/yoyaku/class-info/${newData.id}/`, newData).then(getClassInfo),
              onRowDelete: oldData => axiosInstance.delete(`/yoyaku/class-info/${oldData.id}/`).then(getClassInfo),
            } :
            null
          }
        /> :
        <Typography display='block' variant='body1' color='textSecondary'>サブスクリプションありません</Typography>
      }
      <Typography variant='h6' display='block' color='primary'>プリント</Typography>
      <Paper elevation={24}>
        <Box p={3}>
          {showContent ? 
            <iframe className={classes.printout} src="https://drive.google.com/embeddedfolderview?id=1EMhq3GkTEfsk5NiSHpqyZjS4H2N_aSak#list">
              <Button variant='outlined' className={classes.sectionEnd} color='secondary' target='_blank' rel='noopener noreferrer'
              href='https://drive.google.com/drive/folders/1EMhq3GkTEfsk5NiSHpqyZjS4H2N_aSak?usp=sharing'>
                Googleドライブへ
              </Button>
            </iframe> :
            <Typography display='block' variant='body1' color='textSecondary'>サブスクリプションありません</Typography>
          }
        </Box>
      </Paper>
    </div>
  );
}