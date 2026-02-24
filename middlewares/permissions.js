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

module.exports.checkPermission = (permission) => {
  return (req, res, next) => {
    const userCargo = req.userCargo;

    if (!userCargo) {
      return res.status(403).json({ error: 'Cargo não identificado' });
    }

    if (userCargo === 'gestor') {
      return next();
    }

    const userPermissions = permissions[userCargo];

    if (!userPermissions) {
      return res.status(403).json({ error: 'Cargo inválido' });
    }

    if (userPermissions.cannot.includes(permission)) {
      return res.status(403).json({
        error: 'Acesso negado',
        message: `Usuários do cargo ${userCargo} não podem ${permission}`
      });
    }

    if (
      userPermissions.can.includes('*') ||
      userPermissions.can.includes(permission)
    ) {
      return next();
    }

    return res.status(403).json({
      error: 'Permissão não concedida',
      message: `Permissão ${permission} não autorizada para ${userCargo}`
    });
  };
};