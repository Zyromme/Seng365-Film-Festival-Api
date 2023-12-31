import Ajv from 'ajv';
import addFormats from 'ajv-formats';
const ajv = new Ajv({removeAdditional: 'all', strict: false});
addFormats(ajv);
ajv.addFormat("datetime", /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
ajv.addFormat("integer", /^\d+$/)

const validate = async (schema: object, data: any) => {
    try {
        const validator = ajv.compile(schema);
        const valid = await validator(data);
        if(!valid)
            return ajv.errorsText(validator.errors)
        return true;
    } catch (err) {
        return err.message;
    }
}

export {validate}