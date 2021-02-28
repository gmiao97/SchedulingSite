import React, { useState, useEffect } from 'react';
import MaterialTable from 'material-table';

import { tableIcons } from '../../../util';
import axiosInstance from '../../../axiosApi';


export default function ManagePreschool(props) {
  const [preschoolInfo, setPreschoolInfo] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPreschoolInfo();
  }, []);

  const getPreschoolInfo = async () => {
    let response = await axiosInstance.get(`/yoyaku/preschool-info/`);
    for (let d of response.data) {
      const classSizeResponse = await axiosInstance.get(`/yoyaku/preschool-info/${d.id}/class_size/`);
      d.size = classSizeResponse.data;
    }
    setPreschoolInfo(response.data);
    setLoading(false);
  }

  return(
    <div>
      <MaterialTable 
          title='未就学児クラスの時間割'
          data={preschoolInfo}
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
              emptyDataSourceMessage: '未就学児のデータがありません',
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
            {title: '情報', field: 'name'},
            {title: '人数', field: 'limit', type: 'numeric'},
          ]}
          editable={{
            onRowAdd: newData => axiosInstance.post(`/yoyaku/preschool-info/`, newData).then(getPreschoolInfo),
            onRowUpdate: newData => axiosInstance.put(`/yoyaku/preschool-info/${newData.id}/`, newData).then(getPreschoolInfo),
            onRowDelete: oldData => axiosInstance.delete(`/yoyaku/preschool-info/${oldData.id}/`).then(getPreschoolInfo),
          }}
        />
    </div>
  );
}