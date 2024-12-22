

const getProfile = async (req, res) => {
    try {
        // get user profile.
        const userId = req.userId;
        const result = await getUserById(userId);
        if(result) {
            return successResponse(res, false, "User Profile.", result)
        }

    } catch (error) {
        return badRequestResponse(res, false, "Something went wrong.", error)
    }
}

const updateProfile = async (req, res) => {
    try {
        // get user profile.
        const userId = req.userId;
        const result = await getUserById(userId);
        if(result) {
            return successResponse(res, false, "User Profile.", result)
        }

    } catch (error) {
        return badRequestResponse(res, false, "Something went wrong.", error)
    }
}

const updateProfileImage = async (req, res) => {
    try {
        // get user profile.
        const userId = req.userId;
        const result = await getUserById(userId);
        if(result) {
            return successResponse(res, false, "User Profile.", result)
        }

    } catch (error) {
        return badRequestResponse(res, false, "Something went wrong.", error)
    }
}

const updateProfileEmail = async (req, res) => {
    try {
        // get user profile.
        const userId = req.userId;
        const result = await getUserById(userId);
        if(result) {
            return successResponse(res, false, "User Profile.", result)
        }

    } catch (error) {
        return badRequestResponse(res, false, "Something went wrong.", error)
    }
}