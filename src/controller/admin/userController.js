

const getUsersList = async (req, res) => {
    try {
        // get user profile.
        const result = await getUserById(id);
        if(result) {
            return successResponse(res, false, "User Profile.", result)
        }

    } catch (error) {
        return badRequestResponse(res, false, "Something went wrong.", error)
    }
}

const getUserById = async (req, res) => {
    try {
        // get user profile.
        const result = await getUserById(id);
        if(result) {
            return successResponse(res, false, "User Profile.", result)
        }

    } catch (error) {
        return badRequestResponse(res, false, "Something went wrong.", error)
    }
}

const updateUserById = async (req, res) => {
    try {
        // get user profile.
        const result = await getUserById(id);
        if(result) {
            return successResponse(res, false, "User Profile.", result)
        }

    } catch (error) {
        return badRequestResponse(res, false, "Something went wrong.", error)
    }
}

const updateUserProfileById = async (req, res) => {
    try {
        // get user profile.
        const result = await getUserById(id);
        if(result) {
            return successResponse(res, false, "User Profile.", result)
        }

    } catch (error) {
        return badRequestResponse(res, false, "Something went wrong.", error)
    }
}

const changeUserStatusById = async (req, res) => {
    try {
        // get user profile.
        const result = await getUserById(id);
        if(result) {
            return successResponse(res, false, "User Profile.", result)
        }

    } catch (error) {
        return badRequestResponse(res, false, "Something went wrong.", error)
    }
}

const changeUserStatusByIds = async (req, res) => {
    try {
        // get user profile.
        const result = await getUserById(id);
        if(result) {
            return successResponse(res, false, "User Profile.", result)
        }

    } catch (error) {
        return badRequestResponse(res, false, "Something went wrong.", error)
    }
}
