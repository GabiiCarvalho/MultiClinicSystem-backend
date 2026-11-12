function validarCPF(cpf) {
  if (!cpf) return false;
  const s = String(cpf).replace(/\D/g, "");
  if (s.length !== 11 || /^(\d)\1{10}$/.test(s)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(s[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 1) resto = 0;
  if (resto !== parseInt(s[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(s[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(s[10]);
}

function validarCNPJ(cnpj) {
  if (!cnpj) return false;
  const s = String(cnpj).replace(/\D/g, "");
  if (s.length !== 14 || /^(\d)\1{13}$/.test(s)) return false;

  const calc = (base, pesos) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) soma += parseInt(base[i]) * pesos[i];
    const resto = soma & 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const d1 = calc(s.slice(0, 12), pesos1);
  if (d1 !== parseInt(s[12])) return false;

  const d2 = calc(s.slice(0, 13), pesos2);
  return d2 === parseInt(s[13]);
}

function validarEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email || "").trim());
}

module.exports = { validarCPF, validarCNPJ, validarEmail };
