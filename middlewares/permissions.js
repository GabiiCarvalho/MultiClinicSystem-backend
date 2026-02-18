// Permissões por cargo
const permissions = {
  // Gestor: acesso total ao sistema
  gestor: {
    can: ['*'], // tudo
    cannot: [] // nada negado
  },
  
  // Financeiro: acesso a tudo MENOS cadastrar/agendar pacientes
  financeiro: {
    can: [
      'view_dashboard',
      'view_calendar',
      'view_appointments',
      'view_patient_flow',
      'view_financial',
      'manage_cashier',
      'process_payments',
      'view_reports',
      'view_patients', // pode ver pacientes
      'view_procedures' // pode ver procedimentos
    ],
    cannot: [
      'create_patient',
      'edit_patient',
      'delete_patient',
      'create_appointment',
      'edit_appointment',
      'delete_appointment'
    ]
  },
  
  // Atendente: recepção, cadastro de pacientes e agendamentos
  atendente: {
    can: [
      'view_calendar',
      'view_appointments',
      'create_patient',
      'edit_patient',
      'view_patients',
      'create_appointment',
      'edit_appointment',
      'cancel_appointment',
      'contact_patient'
    ],
    cannot: [
      'view_financial',
      'manage_cashier',
      'process_payments',
      'view_reports',
      'delete_patient',
      'delete_appointment'
    ]
  },
  
  // Dentista: ver seus próprios pacientes e procedimentos
  dentista: {
    can: [
      'view_my_calendar',
      'view_my_appointments',
      'view_my_patients',
      'update_procedure_status',
      'add_observations',
      'view_my_procedures'
    ],
    cannot: [
      'create_patient',
      'edit_patient',
      'delete_patient',
      'create_appointment',
      'delete_appointment',
      'view_financial',
      'manage_cashier'
    ]
  }
};

// Middleware de verificação de permissão
module.exports.checkPermission = (permission) => {
  return (req, res, next) => {
    const userCargo = req.userCargo;
    
    // Gestor tem todas as permissões
    if (userCargo === 'gestor') {
      return next();
    }
    
    const userPermissions = permissions[userCargo];
    
    // Verifica se o cargo existe
    if (!userPermissions) {
      return res.status(403).json({ error: 'Cargo inválido' });
    }
    
    // Verifica se tem permissão
    if (userPermissions.can.includes('*') || userPermissions.can.includes(permission)) {
      // Verifica se não está na lista de negados
      if (userPermissions.cannot.includes(permission)) {
        return res.status(403).json({ 
          error: 'Acesso negado',
          message: `Usuários do cargo ${userCargo} não podem ${permission}`
        });
      }
      return next();
    }
    
    return res.status(403).json({ 
      error: 'Acesso negado',
      message: `Permissão ${permission} não concedida para cargo ${userCargo}`
    });
  };
};

// Middleware para filtrar dados baseado no cargo
module.exports.filterDataByRole = (data, userCargo, userLojaId, userId) => {
  // Todos os dados são filtrados por loja_id primeiro (já feito no middleware loja)
  
  if (userCargo === 'gestor') {
    return data; // Gestor vê tudo da loja
  }
  
  if (userCargo === 'financeiro') {
    // Financeiro vê tudo, mas sem acesso a ações de cadastro
    return data;
  }
  
  if (userCargo === 'atendente') {
    // Atendente vê tudo, mas sem ações financeiras
    return data;
  }
  
  if (userCargo === 'dentista') {
    // Dentista vê apenas seus próprios pacientes e agendamentos
    if (Array.isArray(data)) {
      return data.filter(item => 
        item.dentista_id === userId || 
        item.dentistaId === userId
      );
    }
    // Se for um único item, verifica se pertence ao dentista
    if (data && (data.dentista_id === userId || data.dentistaId === userId)) {
      return data;
    }
    return null;
  }
  
  return data;
};