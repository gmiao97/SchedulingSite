import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import { tableIcons } from '../../util';
import axiosInstance from '../../axiosApi';
import {  
  Typography,
  Box,
  Paper,
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
    showContent && getClassInfo();
  }, []);

  const getClassInfo = async () => {
    let response = await axiosInstance.get(`/yoyaku/class-info/`);
    let classInfoToAdd = [];
    if (props.currentUser.user_type === 'STUDENT') {
      for (let info of response.data) {
        if (info.access === 'preschool' && props.currentProduct.name.includes('未就学児')) {
          classInfoToAdd.push(info);
        }
        if (info.access === 'weekend' && props.currentProduct.name.includes('土日')) {
          classInfoToAdd.push(info);
        } 
        if (info.access === 'all') {
          classInfoToAdd.push(info);
        }
      }
    } else {
      classInfoToAdd = response.data;
    }
    classInfoToAdd.sort((a, b) => a.id - b.id);
    setClassInfo(classInfoToAdd);
    setLoading(false);
  }

  const rules = [
    '・ZOOMの名前を、自分の名前（フルネーム）に設定しましょう。',
    '・参加するときは、ビデオをオンにしましょう。',
    '・見学のときは、名前を『見学・○○（なまえ）』に変えましょう。',
    '・先生の許可なしに、お話をするのはやめましょう。',
    '・他のお友達の迷惑になるような事は、やめましょう。注意してもやめないときは、退出してもらう場合があります。',
    '・授業開始から５分経っても誰も生徒が来ない場合はそのクラスはクローズします。',
  ];

  return(
    <div>
      <Typography variant='h6' display='block' color='primary' gutterBottom>クラスのルール</Typography>
      <Paper elevation={24}>
        <Box p={3}>
          {rules.map(line => 
            <Typography key={line} variant='body1' color='textSecondary'>{line}</Typography>
          )}
          <Typography display='block' variant='caption' color='textSecondary' gutterBottom>何かご事情がある場合は保護者の方からご相談下さい。info@mercy-education.com</Typography>
        </Box>
      </Paper>
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
      <Typography variant='subtitle1' display='block' color='primary'>今月1日～今月末日</Typography>
      {showContent ? 
        <MaterialTable 
          title='ZOOM情報'
          data={classInfo}
          isLoading={loading}
          icons={tableIcons}
          options={{
            sorting: false,
            search: false,
          }}
          localization={{
            pagination: {
              labelDisplayedRows: '{count}の{from}-{to}',
              labelRowsSelect: '行',
            },
            toolbar: {
              nRowsSelected: '{0}行を選択',
            },
            header: {
              actions: 'アクション',
            },
            body: {
              emptyDataSourceMessage: 'ZOOM情報がありません',
              deleteTooltip: '削除',
              addTooltip: '追加',
              editTooltip: '編集',
              editRow: {
                deleteText: '削除を確認しますか？'
              },
            },
          }}
          columns={[
            {title: 'ID', field: 'id', hidden: true},
            {title: 'アクセス', field: 'access', hidden: props.currentUser.user_type !== 'ADMIN', lookup: {all: '全員', weekend: '土日', preschool: '未就学児'}},
            {title: 'レッスン', field: 'name'},
            {title: 'リンク', field: 'link', render: rowData => 
              <MaterialLink href={rowData.link} target='_blank' rel='noopener noreferrer' color='secondary'>
                参加する
              </MaterialLink>
            },
            {title: 'ミーティングID', field: 'meeting_id'},
            {title: 'パスワード', field: 'password'},
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
        <Paper elevation={24}>
          <Box p={3}>
            <Typography display='block' variant='body1' color='textSecondary'>サブスクリプションがありません（月会費を払っていません）</Typography>
          </Box>
        </Paper>
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
            <Typography display='block' variant='body1' color='textSecondary'>サブスクリプションがありません（月会費を払っていません）</Typography>
          }
        </Box>
      </Paper>
    </div>
  );
}